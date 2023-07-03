import { useRef, useState, useEffect } from 'react';
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from '@ethersproject/contracts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FTcontractInterface from '../../artifacts/contracts/Flight.sol/Flight.json'
import IAcontractInterface from '../../artifacts/contracts/Insurance.sol/Insurance.json'

    // /**
    //  * @dev 由航空公司上传航班实际到达时间
    //  * @param _actualArrivalTime 实际到达时间
    //  */
    // 航班号对于机票合约地址
    // mapping(string => address) public flightNumberToAddress;

const Update = ()=>{
    
    const flightNumber = useRef()
    const _actualArrivalTime = useRef();
      // 创建合约对象
  const FTcontractAddress = "0x91d9137F81C1B04e9f5Fc2c77F5eA45E589C31dF";
  const IAcontractAddress = "0x9BeF27A51039DDbc2EBbCB5F6d7FE1078035aE33";
      const FTcontractInterfaceABI = FTcontractInterface.abi;
      const IAcontractInterfaceABI = IAcontractInterface.abi;
      const provider = new Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const FTcontract = new Contract(FTcontractAddress, FTcontractInterfaceABI,signer);
      const IAcontract = new Contract(IAcontractAddress, IAcontractInterfaceABI,signer);
    
        
        const FTUpdate = async()=>{
            console.log(flightNumber.current.value,_actualArrivalTime.current.value);
            if(flightNumber.current.value&&_actualArrivalTime.current.value){
            await FlightUpdate();
            Insurancesettlement()}
        }


      const FlightUpdate = async()=>{
        const actualArrivalTime = new Date(_actualArrivalTime.current.value).getTime()/1000;
        if (!window.confirm('改信息只能更新一次，请确定是否将航班编号为'+flightNumber.current.value+'的实际到达时间更改为'+_actualArrivalTime.current.value)) {
          return
        }
        else{
          try{
            const result =  await FTcontract.update(
                flightNumber.current.value,
                actualArrivalTime)
              console.log(result);
              alert('更新成功')
          }catch(error){
            console.log(error);
        toast.error(error.message);
          }
        }
          
        }
        const Insurancesettlement = async()=>{
              try{
                const result =  await IAcontract.settlement(
                    flightNumber.current.value)
                  console.log(result);
                  alert('结算成功')
              }catch(error){
                console.log(error);
            toast.error(error.message);
              }
            }
              
        
  
  
return(
    
<div className="">
          {/* 更新航班延误信息 */}
<div className="container position-relative wow fadeInUp" data-wow-delay="0.1s" style={{"marginTop" : "1rem"}}>
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="bg-light text-center p-5">
                        <h1 className="mb-4">更新机票详情</h1>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6">
                                    <input ref={flightNumber} type="text" className="form-control border-0" placeholder="航班编号" style={{height: "55px"}}/>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <div className="date">
                                        <input ref={_actualArrivalTime} type="datetime-local" placeholder="实际到达时间"  style={{height: "55px"}}/>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <button  onClick={FTUpdate} className="btn btn-primary w-100 py-3" type="submit">更新</button>
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
export default Update;
