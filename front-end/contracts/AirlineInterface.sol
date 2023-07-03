// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface AirlineInterface {
    // 发布航班事件
    event TicketIssued(
        bytes adr,
        string airlineName,
        uint256 flightNumber,
        string from,
        string to,
        uint32 departureTime,
        uint32 scheduledArrivalTime,
        uint128 ticketPrice
    );

    /**
     * @dev 添加航空公司
     * @param _airlineName 航空公司名称
     * @param _airlineCompany 航空公司地址
     * @param _delayRate 延误率
     * @param _cancelRate 取消率
     */
    function addAirlines(
        string memory _airlineName,
        address _airlineCompany,
        uint128 _delayRate,
        uint128 _cancelRate
    ) external;

    /**
     * @dev 移除航空公司权限
     * @param _airlineCompany 航空公司地址
     */
    function removeAirlines(address _airlineCompany) external;

    /**
     * @dev 修改航空公司自己的名字
     * @param _name 航空公司名称
     */
    function setAirlineName(string memory _name) external;

    /**
     * @dev 更新航空公司自己的延误率
     * @param _delayRate 延误率
     */
    function setDelayRate(uint128 _delayRate) external;

    /**
     * @dev 更新航空公司自己的取消率
     * @param _cancelRate 取消率
     */
    function setCancelRate(uint128 _cancelRate) external;

    /**
     * @dev 发布机票合约(msg.value必须大于_totalSeat * _ticketPrice / 2)
     * @param _totalSeat 总座位数
     * @param _departureTime 出发时间
     * @param _scheduledArrivalTime 预计到达时间
     * @param _ticketPrice 机票价格
     * @param _departurePoint 出发地点
     * @param _destinationPoint 目的地点
     * @param _flightNumber 航班号
     */
    function releaseFlight(
        uint24 _totalSeat,
        uint32 _departureTime,
        uint32 _scheduledArrivalTime,
        uint128 _ticketPrice,
        string memory _departurePoint,
        string memory _destinationPoint,
        uint256 _flightNumber
    ) external payable;

    /**
     * @dev 查看航空公司地址记录的延误率。
     * @param _address 航空公司地址。
     * @return 延误率。
     */
    function getDelayRate(address _address) external view returns (uint256);

    /**
     * @dev 查看航空公司地址记录的取消率。
     * @param _address 航空公司地址。
     * @return 取消率。
     */
    function getCancelRate(address _address) external view returns (uint256);

    /**
     * @dev 查看航空公司的权限。
     * @param _account 航空公司地址。
     * @return 是否有权限。
     */
    function getAirlineAuthority(address _account) external view returns (bool);
}
