// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface FlightInterface {
    enum PlanState {
        None, // 未结束
        OnTimeArrival, // 准时到达
        Canceled, // 航班取消
        LateArrival2, // 延误2小时以内
        LateArrival4, // 延误4小时以内
        LateArrival // 延误4小时以上
    }

    // 航班信息(时间使用UNIX时间)
    struct FlightData {
        PlanState planState; // 航班状态
        bool End; // 航班是否结算
        uint24 totalSeat; // 座位数量
        uint32 departureTime; // 预定起飞时间
        uint32 scheduledArrivalTime; // 预定到达时间
        uint32 actualArrivalTime; //实际到达时间
        uint128 ticketPrice; // 机票价
        bytes32 airline; //航空公司名字
        bytes32 departurePoint; //出发地点
        bytes32 destinationPoint; //目的地
        uint256 flightNumber; //航班号
        address airlineAddress; // 航空公司地址
        // 座位号对应身份证号
        mapping(uint24 => bytes32) seatToIdCard;
        // 身份证号对应座位号
        mapping(bytes32 => uint24) idCardToSeat;
        // 身份证号对应账户地址
        mapping(bytes32 => address) idCardToAddress;
    }

    // 买票，退票事件
    
    event TicketRefund(bytes addr, uint256 flightNumber, string customer, uint24 seat);

    // 仅Airline合约调用的接口
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
    ) external payable;

    /**
     * @dev 购买机票逻辑 (msg.value必须等于机票价格!!!)
     * @param _flightNumber 航班号
     * @param _idCard 身份证号
     * @param _tokenId 座位号
     */
    function buyTicket(
        uint256 _flightNumber,
        string memory _idCard,
        uint24 _tokenId
    ) external payable;

    /**
     * @dev 退票逻辑
     * @param _flightNumber 航班号
     * @param _tokenId 座位号
     */
    function refundTicket(uint256 _flightNumber, uint24 _tokenId) external;

    /**
     * @dev 由航空公司上传航班实际到达时间
     * @param _flightNumber 航班号
     * @param _actualArrivalTime 实际到达时间
     */
    function update(uint256 _flightNumber, uint32 _actualArrivalTime) external;

    /**
     * @dev 输入航班号和身份证返回座位号。
     * @param _flightNumber 航班号。
     * @param _idCard 身份证号。
     * @return 座位号。
     */
    function getIdCardToSeat(uint256 _flightNumber, string memory _idCard)
        external
        view
        returns (uint24);

    /**
     * @dev 返回航班机票价格。
     * @param _flightNumber 航班号。
     * @return 机票价格。
     */
    function getTicketPrice(uint256 _flightNumber)
        external
        view
        returns (uint256);

    /**
     * @dev 返回航班状态。
     * @param _flightNumber 航班号。
     * @return 航班状态。
     */
    function getPlanState(uint256 _flightNumber)
        external
        view
        returns (PlanState);

    /**
     * @dev 返回航班座位数量。
     * @param _flightNumber 航班号。
     * @return 座位数量。
     */
    function getFlightTotalSeat(uint256 _flightNumber)
        external
        view
        returns (uint24);

    /**
     * @dev 获取航班对应的航空公司名称。
     * @param _flightNumber 航班号。
     * @return 航空公司名称。
     */
    function getFlightToAirline(uint256 _flightNumber)
        external
        view
        returns (string memory);

    /**
     * @dev 返回航班在合约中的余额。
     * @param _flightNumber 航班号。
     * @return 航班余额。
     */
    function getBalanceOf(uint256 _flightNumber)
        external
        view
        returns (uint256);

    /**
     * @dev 查看乘客所属账户。
     * @param _flightNumber 航班号。
     * @param _idCard 乘客身份证号。
     * @return 账户地址。
     */
    function getIdCardOwner(uint256 _flightNumber, string memory _idCard)
        external
        view
        returns (address);

    /**
     * @dev 查看航班的预定起飞时间和到达时间。
     * @param _flightNumber 航班号。
     * @return takeOffTime 预定起飞时间  arriveTime 到达时间。
     */
    function getFlightTime(uint256 _flightNumber)
        external
        view
        returns (uint256 takeOffTime, uint256 arriveTime);

    /**
     * @dev 查看航班的出发地点和目的地点。
     * @param _flightNumber 航班号。
     * @return from 出发地点  to 目的地点
     */
    function getPoint(uint256 _flightNumber)
        external
        view
        returns (string memory from, string memory to);

    /**
     * @dev 根据航班号查询空余座位号。
     * @param _flightNumber 航班号。
     * @return 空余座位号数组。
     */
    function getEmptySeat(uint256 _flightNumber)
        external
        view
        returns (uint24[] memory);
}
