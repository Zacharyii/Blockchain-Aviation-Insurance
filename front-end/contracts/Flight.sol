// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./library/String.sol";
import "./library/Address.sol";
import "./FlightInterface.sol";
import "./InsuranceInterface.sol";

contract Flight is FlightInterface {
    using Address for address;
    using String for bytes32;
    using String for string;

    // 合约管理者
    address administrator;

    // 业务合约地址
    address airlineContract;
    address insuranceContract;

    // 航班号对应机票信息
    mapping(uint256 => FlightData) flightNumberToFlight;

    // 记录航班在该合约中的资金
    mapping(uint256 => uint256) balanceOf;

    // 购买保险的前提是已经购买机票
    modifier onlyTicketOwner(uint256 _flightNumber, string memory _idCard) {
        require(
            msg.sender ==
                flightNumberToFlight[_flightNumber].idCardToAddress[
                    _idCard.stringToBytes32()
                ],
            "The ID card is not yours."
        );
        require(
            flightNumberToFlight[_flightNumber].idCardToSeat[
                _idCard.stringToBytes32()
            ] != 0,
            "You don't have a ticket."
        );
        _;
    }

    // 限制用户不能为合约地址
    modifier notContact() {
        require(
            msg.sender.isContract() != true,
            "The account address cannot be a contract."
        );
        _;
    }

    // 限制用户输入的身份证为18位
    modifier isIdCard(string memory _idCard) {
        require(
            bytes(_idCard).length == 18,
            "The ID card entered is not 18 digits."
        );
        _;
    }

    // 限制飞机起飞前2小时不能购买票和保险
    modifier isFlighting2(uint256 _flightNumber) {
        require(
            block.timestamp + 7200 <=
                flightNumberToFlight[_flightNumber].departureTime,
            "Over the buying time"
        );
        _;
    }

    // 限制飞机起飞前4小时不能退票和退保险
    modifier isFlighting4(uint256 _flightNumber) {
        require(
            block.timestamp + 14400 <=
                flightNumberToFlight[_flightNumber].departureTime,
            "It is beyond the refund time"
        );
        _;
    }

    // 限制航班所属航空公司调用
    modifier onlyAirlineOwner(uint256 _flightNumber) {
        require(
            msg.sender == flightNumberToFlight[_flightNumber].airlineAddress,
            "You're not a flight owner."
        );
        _;
    }

    // 限制结算只能一次
    mapping(uint256 => bool) isEnd;
    modifier onlyOnce(uint256 _flightNumber) {
        require(isEnd[_flightNumber] == false, "The flight has been settled.");
        isEnd[_flightNumber] = true;
        _;
    }

    constructor() {
        administrator = msg.sender;
    }

    function setAddress(address _airlineContract, address _insuranceContract)
        external
    {
        require(msg.sender == administrator, "Can not use");
        airlineContract = _airlineContract;
        insuranceContract = _insuranceContract;
    }

    // 只能通过Airline合约进行发布航班
    function createFlight(
        uint24 _totalSeat,
        uint32 _departureTime,
        uint32 _scheduledArrivalTime,
        uint128 _ticketPrice,
        bytes32 _airlineName,
        bytes32 _departurePoint,
        bytes32 _destinationPoint,
        uint256 _flightNumber,
        address _airlineAddress
    ) external payable {
        require(
            flightNumberToFlight[_flightNumber].flightNumber == 0,
            "The flight number already exists"
        );
        require(
            msg.sender == airlineContract,
            "You're not an airline contract"
        );
        require(
            msg.value >= (_totalSeat * _ticketPrice) / 2,
            "Not saving enough money"
        );
        // 传入航班参数
        flightNumberToFlight[_flightNumber].totalSeat = _totalSeat;
        flightNumberToFlight[_flightNumber].departureTime = _departureTime;
        flightNumberToFlight[_flightNumber]
            .scheduledArrivalTime = _scheduledArrivalTime;
        flightNumberToFlight[_flightNumber].ticketPrice = _ticketPrice;
        flightNumberToFlight[_flightNumber].airline = _airlineName;
        flightNumberToFlight[_flightNumber].departurePoint = _departurePoint;
        flightNumberToFlight[_flightNumber]
            .destinationPoint = _destinationPoint;
        flightNumberToFlight[_flightNumber].flightNumber = _flightNumber;
        flightNumberToFlight[_flightNumber].airlineAddress = _airlineAddress;
        balanceOf[_flightNumber] += msg.value;
    }

    // 购买机票逻辑(msg.value必须等于机票价格！！！)
    function buyTicket(
        uint256 _flightNumber,
        string memory _idCard,
        uint24 _seat
    )
        external
        payable
        notContact
        isFlighting2(_flightNumber)
        isIdCard(_idCard)
    {
        // 提交的身份证是否以及购买过机票
        require(
            flightNumberToFlight[_flightNumber].idCardToSeat[
                _idCard.stringToBytes32()
            ] == 0,
            "One ID card can only buy one ticket."
        );
        // 这个座位是否卖出
        require(
            flightNumberToFlight[_flightNumber].seatToIdCard[_seat] ==
                bytes32(0),
            "The seat is for sale."
        );
        // 验证转入的钱是否等于机票价格
        require(
            msg.value == flightNumberToFlight[_flightNumber].ticketPrice,
            "Please transfer the correct ticket price."
        );

        flightNumberToFlight[_flightNumber].seatToIdCard[_seat] = _idCard
            .stringToBytes32();
        flightNumberToFlight[_flightNumber].idCardToSeat[
            _idCard.stringToBytes32()
        ] = _seat;
        flightNumberToFlight[_flightNumber].idCardToAddress[
            _idCard.stringToBytes32()
        ] = msg.sender;

        balanceOf[_flightNumber] += msg.value;
        emit TicketPurchased(abi.encodePacked(msg.sender), _flightNumber, _idCard, _seat);
    }

    // 退票逻辑
    function refundTicket(uint256 _flightNumber, uint24 _seat)
        external
        notContact
        isFlighting4(_flightNumber)
    {
        bytes32 _idCard = flightNumberToFlight[_flightNumber].seatToIdCard[
            _seat
        ];
        require(
            InsuranceInterface(insuranceContract).checkInsurance(
                _flightNumber,
                _idCard.bytes32ToString(),
                _seat
            ) == false,
            "You need to surrender your insurance first"
        );
        require(
            flightNumberToFlight[_flightNumber].idCardToAddress[_idCard] ==
                msg.sender,
            "This ticket doesn't belong to you."
        );
        flightNumberToFlight[_flightNumber].seatToIdCard[_seat] = bytes32(0);
        flightNumberToFlight[_flightNumber].idCardToSeat[_idCard] = 0;
        flightNumberToFlight[_flightNumber].idCardToAddress[_idCard] = address(
            0
        );

        payable(msg.sender).transfer(
            flightNumberToFlight[_flightNumber].ticketPrice
        );
        balanceOf[_flightNumber] -= flightNumberToFlight[_flightNumber]
            .ticketPrice;

        emit TicketRefund(abi.encodePacked(msg.sender), _flightNumber, _idCard.bytes32ToString(), _seat);
    }

    // 由航空公司上传航班实际到达时间
    function update(uint256 _flightNumber, uint32 _actualArrivalTime)
        external
        onlyOnce(_flightNumber)
        onlyAirlineOwner(_flightNumber)
    {
        // 更新航班实际到达时间逻辑
        flightNumberToFlight[_flightNumber]
            .actualArrivalTime = _actualArrivalTime;
        // 判断航班状态
        _updateFlightStatus(_flightNumber);

        if (
            flightNumberToFlight[_flightNumber].planState ==
            PlanState.OnTimeArrival
        ) {
            uint256 _balance = balanceOf[_flightNumber];
            payable(msg.sender).transfer(balanceOf[_flightNumber]);
            balanceOf[_flightNumber] -= _balance;
            balanceOf[_flightNumber] = 0;
            uint256 _planState = uint256(
                flightNumberToFlight[_flightNumber].planState
            );
            InsuranceInterface(insuranceContract).updatePlanState(
                _flightNumber,
                _planState
            );
        } else if (
            flightNumberToFlight[_flightNumber].planState == PlanState.Canceled
        ) {
            uint128 _ticketPrice = flightNumberToFlight[_flightNumber]
                .ticketPrice;
            bytes32 _idCard;
            for (
                uint24 i = 1;
                i <= flightNumberToFlight[_flightNumber].totalSeat;
                i++
            ) {
                _idCard = flightNumberToFlight[_flightNumber].seatToIdCard[i];
                if (
                    flightNumberToFlight[_flightNumber].seatToIdCard[i] !=
                    bytes32(0)
                ) {
                    payable(
                        flightNumberToFlight[_flightNumber].idCardToAddress[
                            _idCard
                        ]
                    ).transfer(_ticketPrice);
                    balanceOf[_flightNumber] -= _ticketPrice;
                }
            }
            uint256 _planState = uint256(
                flightNumberToFlight[_flightNumber].planState
            );
            InsuranceInterface(insuranceContract).updatePlanState{
                value: balanceOf[_flightNumber]
            }(_flightNumber, _planState);
            balanceOf[_flightNumber] = 0;
        } else {
            uint256 _planState = uint256(
                flightNumberToFlight[_flightNumber].planState
            );
            InsuranceInterface(insuranceContract).updatePlanState{
                value: balanceOf[_flightNumber]
            }(_flightNumber, _planState);
            balanceOf[_flightNumber] = 0;
        }
    }

    // 更新航班状态
    function _updateFlightStatus(uint256 _flightNumber) private {
        if (flightNumberToFlight[_flightNumber].actualArrivalTime == 0) {
            // 航班被取消了
            flightNumberToFlight[_flightNumber].planState = PlanState.Canceled;
        } else {
            if (
                flightNumberToFlight[_flightNumber].actualArrivalTime <=
                flightNumberToFlight[_flightNumber].scheduledArrivalTime
            ) {
                // 航班准时到达
                flightNumberToFlight[_flightNumber].planState = PlanState
                    .OnTimeArrival;
            } else {
                uint256 delayTime = (flightNumberToFlight[_flightNumber]
                    .actualArrivalTime -
                    flightNumberToFlight[_flightNumber].scheduledArrivalTime) /
                    60;
                if (delayTime <= 120) {
                    // 延误两小时以内
                    flightNumberToFlight[_flightNumber].planState = PlanState
                        .LateArrival2;
                } else if (delayTime <= 240) {
                    // 延误4小时以内
                    flightNumberToFlight[_flightNumber].planState = PlanState
                        .LateArrival4;
                } else {
                    // 延误4小时以上
                    flightNumberToFlight[_flightNumber].planState = PlanState
                        .LateArrival;
                }
            }
        }
    }

    // 输入航班号和身份证返回座位号
    function getIdCardToSeat(uint256 _flightNumber, string memory _idCard)
        external
        view
        returns (uint24)
    {
        return
            flightNumberToFlight[_flightNumber].idCardToSeat[
                _idCard.stringToBytes32()
            ];
    }

    // 返回航班机票价格
    function getTicketPrice(uint256 _flightNumber)
        external
        view
        returns (uint256)
    {
        return flightNumberToFlight[_flightNumber].ticketPrice;
    }

    // 返回航班座位数量
    function getFlightTotalSeat(uint256 _flightNumber)
        external
        view
        returns (uint24)
    {
        return flightNumberToFlight[_flightNumber].totalSeat;
    }

    // 返回航班状态
    function getPlanState(uint256 _flightNumber)
        external
        view
        returns (PlanState)
    {
        return flightNumberToFlight[_flightNumber].planState;
    }

    // 查看航班号对应的航空公司名字
    function getFlightToAirline(uint256 _flightNumber)
        external
        view
        returns (string memory)
    {
        return flightNumberToFlight[_flightNumber].airline.bytes32ToString();
    }

    // 查看乘客所属账户
    function getIdCardOwner(uint256 _flightNumber, string memory _idCard)
        external
        view
        returns (address)
    {
        return
            flightNumberToFlight[_flightNumber].idCardToAddress[
                _idCard.stringToBytes32()
            ];
    }

    // 查看航班的预定起飞时间和到达时间
    function getFlightTime(uint256 _flightNumber)
        external
        view
        returns (uint256 takeOffTime, uint256 arriveTime)
    {
        takeOffTime = flightNumberToFlight[_flightNumber].departureTime;
        arriveTime = flightNumberToFlight[_flightNumber].scheduledArrivalTime;
    }

    // 查看航班的出发地点
    function getPoint(uint256 _flightNumber)
        external
        view
        returns (string memory from, string memory to)
    {
        from = flightNumberToFlight[_flightNumber]
            .departurePoint
            .bytes32ToString(); //出发地点
        to = flightNumberToFlight[_flightNumber]
            .destinationPoint
            .bytes32ToString(); //目的地
    }

    // 根据航班号查询空余座位号
    function getEmptySeat(uint256 _flightNumber)
        external
        view
        returns (uint24[] memory)
    {
        uint24[] memory emptySeat = new uint24[](
            flightNumberToFlight[_flightNumber].totalSeat
        );
        uint24 n = 0;
        for (
            uint24 i = 1;
            i <= flightNumberToFlight[_flightNumber].totalSeat;
            i++
        ) {
            if (
                flightNumberToFlight[_flightNumber].seatToIdCard[i] ==
                bytes32(0)
            ) {
                emptySeat[n] = i;
                n++;
            }
        }
        return emptySeat;
    }

    function getBalanceOf(uint256 _flightNumber)
        external
        view
        returns (uint256)
    {
        return balanceOf[_flightNumber];
    }
}
