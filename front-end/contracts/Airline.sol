// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./library/String.sol";
import "./library/Address.sol";
import "./AirlineInterface.sol";
import "./FlightInterface.sol";
import "./InsuranceInterface.sol";

contract Airline is AirlineInterface {
    using Address for address;
    using String for bytes32;
    using String for string;

    // 业务合约地址
    address flightContract;
    address insuranceContract;

    // 合约管理者
    address administrator;
    // 保存航空公司的延误率，取消率，航空公司名字；
    mapping(address => uint128) delayRates; // 延误率值为百分率 * 10000
    mapping(address => uint128) cancelRates; // 取消率值为百分率 * 10000
    mapping(address => bytes32) airlineName;

    // 记录航空公司的发布机票和发布保险的权限
    mapping(address => bool) airlineAuthority;

    // 限制航空公司权限
    modifier onlyAirline() {
        require(
            airlineAuthority[msg.sender] == true,
            "You don't have airline status."
        );
        _;
    }

    // 限制平台管理员权限
    modifier onlyAdministrator() {
        require(
            msg.sender == administrator,
            "You are not an airline DAO administrator!"
        );
        _;
    }

    constructor() {
        // 将部署合约的地址设置为管理者；
        administrator = msg.sender;
    }

    function setAddress(address _flightContract, address _insuranceContract)
        external
        onlyAdministrator
    {
        flightContract = _flightContract;
        insuranceContract = _insuranceContract;
    }

    // 添加航空公司
    function addAirlines(
        string memory _airlineName,
        address _airlineCompany,
        uint128 _delayRate,
        uint128 _cancelRate
    ) external onlyAdministrator {
        require(airlineAuthority[_airlineCompany] = true, "Airlines to add");
        airlineName[_airlineCompany] = _airlineName.stringToBytes32();
        airlineAuthority[_airlineCompany] = true;
        delayRates[_airlineCompany] = _delayRate;
        cancelRates[_airlineCompany] = _cancelRate;
    }

    // 移除航空公司权限
    function removeAirlines(address _airlineCompany)
        external
        onlyAdministrator
    {
        airlineAuthority[_airlineCompany] = false;
    }

    // 修改航空公司自己的名字
    function setAirlineName(string memory _name) external onlyAirline {
        airlineName[msg.sender] = _name.stringToBytes32();
    }

    // 更新航空公司自己的延误率
    function setDelayRate(uint128 _delayRate) external onlyAirline {
        require(
            _delayRate <= 10000 && _delayRate >= 100,
            "The incoming delay rate is illegal"
        );
        delayRates[msg.sender] = _delayRate;
    }

    // 更新航空公司自己的取消率
    function setCancelRate(uint128 _cancelRate) external onlyAirline {
        require(
            _cancelRate <= 10000 && _cancelRate >= 100,
            "The incoming cancel rate is illegal"
        );
        cancelRates[msg.sender] = _cancelRate;
    }

    // 必须转入足够的资金，_totalSeat * _ticketPrice / 2;
    // 发布机票合约（传入的时间参数采取UNIX时间）
    function releaseFlight(
        uint24 _totalSeat,
        uint32 _departureTime,
        uint32 _scheduledArrivalTime,
        uint128 _ticketPrice,
        string memory _departurePoint,
        string memory _destinationPoint,
        uint256 _flightNumber
    ) external payable onlyAirline {
        require(
            msg.value >= (_totalSeat * _ticketPrice) / 2,
            "Not saving enough money"
        );
        // 发布航班
        bytes32 _airlineName = airlineName[msg.sender];
        FlightInterface(flightContract).createFlight{value: msg.value}(
            _totalSeat,
            _departureTime,
            _scheduledArrivalTime,
            _ticketPrice,
            _airlineName,
            _departurePoint.stringToBytes32(),
            _destinationPoint.stringToBytes32(),
            _flightNumber,
            msg.sender
        );
        // 创建保险
        uint128 _delayInsurancePrice = (delayRates[msg.sender] * _ticketPrice) /
            10000;
        uint128 _cancelInsurancePrice = (cancelRates[msg.sender] *
            _ticketPrice) / 10000;
        InsuranceInterface(insuranceContract).createInsurance(
            _flightNumber,
            _totalSeat,
            _delayInsurancePrice,
            _cancelInsurancePrice,
            msg.sender
        );
        emit TicketIssued(
            abi.encodePacked(msg.sender),
            _airlineName.bytes32ToString(),
            _flightNumber,
            _departurePoint,
            _destinationPoint,
            _departureTime,
            _scheduledArrivalTime,
            _ticketPrice
        );
    }

    // 查看航空公司地址记录的延误率
    function getDelayRate(address _address) external view returns (uint256) {
        return delayRates[_address];
    }

    // 查看航空公司地址记录的取消率
    function getCancelRate(address _address) external view returns (uint256) {
        return cancelRates[_address];
    }

    // 获取查看航空公司的权限
    function getAirlineAuthority(address _account)
        external
        view
        returns (bool)
    {
        return airlineAuthority[_account];
    }
}
