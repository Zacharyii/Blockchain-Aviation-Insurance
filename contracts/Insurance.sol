// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./FlightInterface.sol";
import "./InsuranceInterface.sol";
import "./library/String.sol";
import "./library/Address.sol";

contract Insurance is InsuranceInterface {
    using Address for address;
    using String for bytes32;
    using String for string;

    // 合约管理者
    address administrator;

    // 业务合约地址
    address flightContract;
    address airlineContract;

    // 航班号对应保险
    mapping(uint256 => InsuranceData) flightNumberToInsurance;

    // 航班状态
    mapping(uint256 => PlanState) planState;

    // 航班在该合约中的资金
    mapping(uint256 => uint256) balanceOf;

    // 限制用户输入的身份证为18位
    modifier isIdCard(string memory _idCard) {
        require(
            bytes(_idCard).length == 18,
            "The ID card entered is not 18 digits."
        );
        _;
    }

    // 限制保险结算只能一次
    mapping(uint256 => bool) isEnd;
    modifier onlyOnce(uint256 _flightNumber) {
        require(isEnd[_flightNumber] == false, "The flight has been settled.");
        isEnd[_flightNumber] = true;
        _;
    }

    // 限制飞机起飞前2小时不能购买票和保险
    modifier isFlighting2(uint256 _flightNumber) {
        (uint256 departureTime, ) = FlightInterface(flightContract)
            .getFlightTime(_flightNumber);
        require(
            block.timestamp + 7200 <= departureTime,
            "Over the buying time"
        );
        _;
    }

    // 限制飞机起飞前4小时不能退票和退保险
    modifier isFlighting4(uint256 _flightNumber) {
        (uint256 departureTime, ) = FlightInterface(flightContract)
            .getFlightTime(_flightNumber);
        require(
            block.timestamp + 14400 <= departureTime,
            "It is beyond the refund time"
        );
        _;
    }

    constructor() {
        administrator = msg.sender;
    }

    function setAddress(address _airlineContract, address _flightContract)
        external
    {
        require(msg.sender == administrator, "Can not use");
        flightContract = _flightContract;
        airlineContract = _airlineContract;
    }

    // 创建保险
    function createInsurance(
        uint256 _flightNumber,
        uint24 _totalSeat,
        uint128 _delayInsurancePrice,
        uint128 _cancelInsurancePrice,
        address _airline
    ) external {
        require(
            msg.sender == airlineContract,
            "You're not an airline contract"
        );
        require(
            flightNumberToInsurance[_flightNumber].flightNumber == 0,
            "The flight number already exists"
        );
        flightNumberToInsurance[_flightNumber].flightNumber = _flightNumber;
        flightNumberToInsurance[_flightNumber].totalSeat = _totalSeat;
        flightNumberToInsurance[_flightNumber]
            .delayInsurancePrice = _delayInsurancePrice;
        flightNumberToInsurance[_flightNumber]
            .cancelInsurancePrice = _cancelInsurancePrice;
        flightNumberToInsurance[_flightNumber].airline = _airline;
    }

    // 购买保险逻辑（msg.value必须等于保金价格！！！！）
    function buyInsurance(
        uint256 _flightNumber,
        uint8 choose,
        string memory _idCard
    ) external payable isIdCard(_idCard) isFlighting2(_flightNumber) {
        uint256 price;
        require(
            choose == 1 || choose == 2 || choose == 3,
            "Illegal parameter."
        );
        uint24 _seat = FlightInterface(flightContract).getIdCardToSeat(
            _flightNumber,
            _idCard
        );
        address _addr = FlightInterface(flightContract).getIdCardOwner(
            _flightNumber,
            _idCard
        );
        require(msg.sender == _addr, "The ID card is not yours.");
        require(_seat != 0, "You don't have a ticket.");
        // 1表示购买延误险，2表示购买取消险，3表示两种保险都购买
        if (choose == 1) {
            price = flightNumberToInsurance[_flightNumber].delayInsurancePrice;
            require(
                flightNumberToInsurance[_flightNumber].delayToIdCard[_seat] ==
                    bytes32(0),
                "Delay insurance has been purchased"
            );
            require(msg.value == price, "The amount transferred is incorrect.");
            flightNumberToInsurance[_flightNumber].delayToIdCard[
                _seat
            ] = _idCard.stringToBytes32();
            flightNumberToInsurance[_flightNumber].idCardToAddress[
                _idCard.stringToBytes32()
            ] = msg.sender;
            emit InsurancePurchased(abi.encodePacked(msg.sender), _flightNumber, _idCard, 1);
        } else if (choose == 2) {
            price = flightNumberToInsurance[_flightNumber].cancelInsurancePrice;
            require(
                flightNumberToInsurance[_flightNumber].cancelToIdCard[_seat] ==
                    bytes32(0),
                "Cancel insurance has been purchased"
            );
            require(msg.value == price, "The amount transferred is incorrect.");
            flightNumberToInsurance[_flightNumber].cancelToIdCard[
                _seat
            ] = _idCard.stringToBytes32();
            flightNumberToInsurance[_flightNumber].idCardToAddress[
                _idCard.stringToBytes32()
            ] = msg.sender;
            emit InsurancePurchased(abi.encodePacked(msg.sender), _flightNumber, _idCard, 2);
        } else if (choose == 3) {
            price =
                flightNumberToInsurance[_flightNumber].delayInsurancePrice +
                flightNumberToInsurance[_flightNumber].cancelInsurancePrice;
            require(
                flightNumberToInsurance[_flightNumber].delayToIdCard[_seat] ==
                    bytes32(0) &&
                    flightNumberToInsurance[_flightNumber].cancelToIdCard[
                        _seat
                    ] ==
                    bytes32(0),
                "Insurance has been purchased"
            );
            require(msg.value == price, "The amount transferred is incorrect.");
            flightNumberToInsurance[_flightNumber].delayToIdCard[
                _seat
            ] = _idCard.stringToBytes32();
            flightNumberToInsurance[_flightNumber].cancelToIdCard[
                _seat
            ] = _idCard.stringToBytes32();
            flightNumberToInsurance[_flightNumber].idCardToAddress[
                _idCard.stringToBytes32()
            ] = msg.sender;
            emit InsurancePurchased(abi.encodePacked(msg.sender), _flightNumber, _idCard, 3);
        }
        balanceOf[_flightNumber] += msg.value;
    }

    // 退保险
    function refundInsurance(uint256 _flightNumber, string memory _idCard)
        external
        isFlighting4(_flightNumber)
    {
        uint256 price;
        uint24 _seat = FlightInterface(flightContract).getIdCardToSeat(
            _flightNumber,
            _idCard
        );
        require(
            flightNumberToInsurance[_flightNumber].idCardToAddress[
                _idCard.stringToBytes32()
            ] == msg.sender,
            "The ID card is not yours."
        );
        if (
            flightNumberToInsurance[_flightNumber].delayToIdCard[_seat] ==
            _idCard.stringToBytes32()
        ) {
            price += flightNumberToInsurance[_flightNumber].delayInsurancePrice;
            flightNumberToInsurance[_flightNumber].delayToIdCard[
                _seat
            ] = bytes32(0);
            flightNumberToInsurance[_flightNumber].idCardToAddress[
                _idCard.stringToBytes32()
            ] = address(0);
            emit InsuranceRefund(abi.encodePacked(msg.sender), _flightNumber, _idCard, 1);
        }
        if (
            flightNumberToInsurance[_flightNumber].cancelToIdCard[_seat] ==
            _idCard.stringToBytes32()
        ) {
            price += flightNumberToInsurance[_flightNumber]
                .cancelInsurancePrice;
            flightNumberToInsurance[_flightNumber].cancelToIdCard[
                _seat
            ] = bytes32(0);
            flightNumberToInsurance[_flightNumber].idCardToAddress[
                _idCard.stringToBytes32()
            ] = address(0);
            emit InsuranceRefund(abi.encodePacked(msg.sender), _flightNumber, _idCard, 2);
        }
        payable(msg.sender).transfer(price);
        balanceOf[_flightNumber] -= price;
    }

    // 更新航班状态（只能通过航班合约调用）（!!!）
    function updatePlanState(uint256 _flightNumber, uint256 _planState)
        external
        payable
    {
        require(
            msg.sender == flightContract,
            "Only the flight contract can be called"
        );
        planState[_flightNumber] = PlanState(_planState);
        balanceOf[_flightNumber] += msg.value;
    }

    // 进行保险结算
    function settlement(uint256 _flightNumber)
        external
        onlyOnce(_flightNumber)
    {
        // 限制航班所属公司身份
        require(
            msg.sender == flightNumberToInsurance[_flightNumber].airline,
            "You are not the company of the flight"
        );
        if (planState[_flightNumber] == PlanState.OnTimeArrival) {
            _settlementOnTime(_flightNumber);
        } else if (planState[_flightNumber] == PlanState.Canceled) {
            _compensationCancel(_flightNumber);
        } else if (planState[_flightNumber] == PlanState.LateArrival2) {
            _compensationDelay(_flightNumber, 25);
        } else if (planState[_flightNumber] == PlanState.LateArrival4) {
            _compensationDelay(_flightNumber, 50);
        } else if (planState[_flightNumber] == PlanState.LateArrival) {
            _compensationDelay(_flightNumber, 75);
        }
    }

    // 准时到达结算
    function _settlementOnTime(uint256 _flightNumber) private {
        payable(msg.sender).transfer(balanceOf[_flightNumber]);
        balanceOf[_flightNumber] = 0;
    }

    // 航班取消赔付
    function _compensationCancel(uint256 _flightNumber) private {
        uint256 _ticketPrice = FlightInterface(flightContract).getTicketPrice(
            _flightNumber
        );
        uint256 _cancelPrice = _ticketPrice / 2;
        bytes32 _delayToIdCard;
        bytes32 _cancelToIdCard;
        uint256 _price;
        address _idCardToAddress;
        for (
            uint24 i = 1;
            i <= flightNumberToInsurance[_flightNumber].totalSeat;
            i++
        ) {
            _delayToIdCard = flightNumberToInsurance[_flightNumber]
                .delayToIdCard[i];
            _cancelToIdCard = flightNumberToInsurance[_flightNumber]
                .cancelToIdCard[i];
            if (_delayToIdCard != bytes32(0)) {
                _price += flightNumberToInsurance[_flightNumber]
                    .delayInsurancePrice;
                _idCardToAddress = flightNumberToInsurance[_flightNumber]
                    .idCardToAddress[_delayToIdCard];
            }
            if (_cancelToIdCard != bytes32(0)) {
                _price += _cancelPrice;
                _idCardToAddress = flightNumberToInsurance[_flightNumber]
                    .idCardToAddress[_cancelToIdCard];
            }
            payable(_idCardToAddress).transfer(_price);
            balanceOf[_flightNumber] -= _price;
            _delayToIdCard = bytes32(0);
            _cancelToIdCard = bytes32(0);
            _price = 0;
            _idCardToAddress = address(0);
        }
        payable(msg.sender).transfer(balanceOf[_flightNumber]);
        balanceOf[_flightNumber] = 0;
    }

    // 航班延误赔付
    function _compensationDelay(uint256 _flightNumber, uint8 _percentage)
        private
    {
        uint256 _ticketPrice = FlightInterface(flightContract).getTicketPrice(
            _flightNumber
        );
        uint256 _price = (_ticketPrice * _percentage) / 100;
        bytes32 _idCard;
        for (
            uint24 i = 1;
            i <= flightNumberToInsurance[_flightNumber].totalSeat;
            i++
        ) {
            _idCard = flightNumberToInsurance[_flightNumber].delayToIdCard[i];
            if (
                flightNumberToInsurance[_flightNumber].idCardToAddress[
                    _idCard
                ] != address(0)
            ) {
                balanceOf[_flightNumber] -= _price;
                payable(
                    flightNumberToInsurance[_flightNumber].idCardToAddress[
                        _idCard
                    ]
                ).transfer(_price);
            }
        }
        payable(msg.sender).transfer(balanceOf[_flightNumber]);
        balanceOf[_flightNumber] = 0;
    }

    function checkInsurance(
        uint256 _flightNumber,
        string memory _idCard,
        uint24 _seat
    ) external view returns (bool) {
        if (
            flightNumberToInsurance[_flightNumber].delayToIdCard[_seat] ==
            _idCard.stringToBytes32() ||
            flightNumberToInsurance[_flightNumber].cancelToIdCard[_seat] ==
            _idCard.stringToBytes32()
        ) {
            return true;
        } else {
            return false;
        }
    }

    // 查看保金价格
    function getInsurancePrice(uint256 _flightNumber)
        external
        view
        returns (uint128 _delayInsurancePrice, uint128 _cancelInsurancePrice)
    {
        _delayInsurancePrice = flightNumberToInsurance[_flightNumber]
            .delayInsurancePrice;
        _cancelInsurancePrice = flightNumberToInsurance[_flightNumber]
            .cancelInsurancePrice;
    }

    function getBalanceOf(uint256 _flightNumber)
        external
        view
        returns (uint256)
    {
        return balanceOf[_flightNumber];
    }
}
