// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface InsuranceInterface {
    // 参保，退保事件
    // insuranceName :  delayInsurance 延误险  cancelInsurance 取消险
    event InsurancePurchased(
        bytes addr,
        uint256 flightNumber,
        string customer,
        uint8 insuranceClass
    );
    event InsuranceRefund(
        bytes addr,
        uint256 flightNumber,
        string customer,
        uint8 insuranceClass
    );

    // 保险结构体
    struct InsuranceData {
        uint24 totalSeat; // 座位数量
        uint128 delayInsurancePrice; // 延误险保金
        uint128 cancelInsurancePrice; // 取消险保金
        uint256 flightNumber; //航班号
        address airline; // 航空公司地址
        // 记录延误险购买情况
        mapping(uint24 => bytes32) delayToIdCard;
        // 记录取消险购买情况
        mapping(uint24 => bytes32) cancelToIdCard;
        // 记录身份证对应账户地址
        mapping(bytes32 => address) idCardToAddress;
    }

    enum PlanState {
        None, // 未结束
        OnTimeArrival, // 准时到达
        Canceled, // 航班取消
        LateArrival2, // 延误2小时以内
        LateArrival4, // 延误4小时以内
        LateArrival // 延误4小时以上
    }

    // 仅Airline合约调用的接口
    function createInsurance(
        uint256 _flightNumber,
        uint24 _totalSeat,
        uint128 _delayInsurancePrice,
        uint128 _cancelInsurancePrice,
        address _airline
    ) external;

    /**
     * @dev 购买保险逻辑 (msg.value必须等于保金价格!!!)
     * @param _flightNumber 航班号
     * @param choose 保险选择（0：延误险，1：取消险，2：延误险+取消险）
     * @param _idCard 身份证号
     */
    function buyInsurance(
        uint256 _flightNumber,
        uint8 choose,
        string memory _idCard
    ) external payable;

    /**
     * @dev 退保险逻辑
     * @param _flightNumber 航班号
     * @param _idCard 身份证号
     */
    function refundInsurance(uint256 _flightNumber, string memory _idCard)
        external;

    // 仅Flight合约调用的接口
    function updatePlanState(uint256 _flightNumber, uint256 _planState)
        external
        payable;

    // 仅Flight合约调用的接口
    function checkInsurance(
        uint256 _flightNumber,
        string memory _idCard,
        uint24 _seat
    ) external view returns (bool);

    /**
     * @dev 进行保险结算
     * @param _flightNumber 航班号
     */
    function settlement(uint256 _flightNumber) external;

    /**
     * @dev 查询保金价格。
     * @param _flightNumber 航班号。
     * @return _delayInsurancePrice 延误险保金   _cancelInsurancePrice取消险保金
     */
    function getInsurancePrice(uint256 _flightNumber)
        external
        view
        returns (uint128 _delayInsurancePrice, uint128 _cancelInsurancePrice);

    /**
     * @dev 返回航班在合约中的余额。
     * @param _flightNumber 航班号。
     * @return 航班余额。
     */
    function getBalanceOf(uint256 _flightNumber)
        external
        view
        returns (uint256);
}
