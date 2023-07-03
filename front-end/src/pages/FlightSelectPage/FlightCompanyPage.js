import { useRef } from 'react';
import { utils } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from '@ethersproject/contracts';
import ALContractABI from "../../artifacts/contracts/Airline.sol/Airline.json"
const FlightCompanyPage = () => {
 
    //  /**
    //  * @dev 发布机票合约(msg.value必须大于_totalSeat * _ticketPrice / 2)
    //  * @param _totalSeat 总座位数
    //  * @param _departureTime 出发时间
    //  * @param _scheduledArrivalTime 预计到达时间
    //  * @param _ticketPrice 机票价格
    //  * @param _departurePoint 出发地点
    //  * @param _destinationPoint 目的地点
    //  * @param _flightNumber 航班号
    //  */
    const flightNumber = useRef();
    const departureTime = useRef();
    const scheduledArrivalTime = useRef();
    const totalSeat = useRef();
    const ticketPrice = useRef();
    const departurePoint = useRef()
    const destinationPoint = useRef()

    // 创建合约对象
    const contractInterface = new utils.Interface(ALContractABI.abi);
    const contractAddress = "0xA54A1E3Ab0E21Dd659537475DcA261ffe3FA0e7e";
    const provider = new Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new Contract(contractAddress, contractInterface,signer);
  
  
    const releaseFlight = async()=>{
        // 检查 contract 对象是否存在
        if (!contract) {
          console.error("合约对象为空！");
          return;
        }
    
        // 获取用户输入的参数，并进行一些验证和格式化
        const flightNumberValue = flightNumber.current.value.trim();
        if (!flightNumberValue) {
          toast.error("请输入一个航班编号！");
          return;
        }
        const departureTimeValue = new Date(departureTime.current.value).getTime() / 1000;
        if (isNaN(departureTimeValue)) {
          toast.error("请输入出发时间！");
          return;
        }
        const scheduledArrivalTimeValue = new Date(scheduledArrivalTime.current.value).getTime() / 1000;
        if (isNaN(scheduledArrivalTimeValue)) {
          toast.error("请输入预计到达时间！");
          return;
        }
        if (departureTimeValue >= scheduledArrivalTimeValue) {
          toast.error("输入的到达时间小于出发时间！");
          return;
        }
        const totalSeatValue = parseInt(totalSeat.current.value);
        if (isNaN(totalSeatValue) || totalSeatValue <= 0) {
          toast.error("请输入一个正确的座位数！");
          return;
        }
        const ticketPriceValue = parseFloat(ticketPrice.current.value);
        if (isNaN(ticketPriceValue) || ticketPriceValue <= 0) {
          toast.error("请输入一个正确的票价！");
          return;
        }const departurePointValue = departurePoint.current.value;
        if (!departurePointValue) {
          toast.error("请输入出发地！");
          return;
        }const destinationPointValue = destinationPoint.current.value;
        if (!destinationPointValue) {
          toast.error("请输入目的地！");
          return;
        } else{
          try{
            const result =  await contract.releaseFlight(
              totalSeatValue,
              departureTimeValue ,
              scheduledArrivalTimeValue,
              utils.parseEther(ticketPriceValue.toString()),
              departurePointValue,
              destinationPointValue,
              flightNumberValue,{
                value: utils.parseEther((ticketPriceValue*totalSeatValue/2).toString())
              })
              console.log(result);
              alert('发布航班成功')
          }catch(error){
            console.log(error);
        toast.error(error.message);
          }
        }
    }


    return (
      <div>
      {/* 发布航班机票 */}
      <div className="container position-relative wow fadeInUp" data-wow-delay="0.1s" style={{"marginTop" : "1rem"}}>
      <div className="row justify-content-center">
          <div className="col-lg-8">
              <div className="bg-light text-center p-5">
                  <h1 className="mb-4">发布航班信息</h1>
                      <div className="row g-3">
                      <div className="col-12 col-sm-6">
                              <input ref={flightNumber} type="text" className="form-control border-0" placeholder="航班编号" style={{height: "55px"}}/>
                          </div> 
                          <div className="col-12 col-sm-6">
                              <input ref={departurePoint} type="text" className="form-control border-0" placeholder="出发地" style={{height: "55px"}}/>
                          </div> 
                          <div className="col-12 col-sm-6">
                              <input ref={destinationPoint} type="text" className="form-control border-0" placeholder="目的地" style={{height: "55px"}}/>
                          </div>
                          <div className="col-12 col-sm-6">
                              <input ref={totalSeat} type="text" className="form-control border-0" placeholder="总座位数" style={{height: "55px"}}/>
                          </div> 
                          <div className="col-12 col-sm-6">
                              <input ref={ticketPrice} type="text" className="form-control border-0" placeholder="机票价格" style={{height: "55px"}}/>
                          </div>
                          <div className="col-12 col-sm-6">
                          <div className="date">预计起飞时间
                                  <input ref={departureTime} type="datetime-local" placeholder="预计起飞时间"  style={{height: "55px"}}/>
                              </div>
                              <div className="date">预计到达时间
                                  <input ref={scheduledArrivalTime} type="datetime-local" placeholder="预计到达时间"  style={{height: "55px"}}/>
                              </div>
                          </div>
                          <div className="col-12">
                              <button  onClick={releaseFlight} className="btn btn-primary w-100 py-3" type="submit">发布</button>
                          </div>
                      </div>
              </div>
          </div>
      </div>
  </div>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                />
        </div>
    )
}

export default FlightCompanyPage;