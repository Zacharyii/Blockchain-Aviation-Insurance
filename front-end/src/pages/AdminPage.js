import { useContractFunction } from "@usedapp/core";
import { utils } from 'ethers';
import { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPage = ({ contract }) => {
    //  /**
    //  * @dev 添加航空公司
    //  * @param _airlineCompany 航空公司的地址
    //  */
    //  function addAirlines(address _airlineCompany,string memory _airlineName,uint8 _delayRates,uint8 _cancelRates) external;

    //  /**
    //   * @dev 移除航空公司
    //   * @param _airlineCompany 航空公司的地址
    //   */
    //  function removeAirlines(address _airlineCompany) external;

    console.log(contract);
    const delayRates = useRef();
    const cancelRates = useRef();
    const airlineAddress = useRef();
    const removeAirlineAddress = useRef();
    const airlineName = useRef();
    const removeairlineName = useRef();

    const [functionName, setFunctionName] = useState('');
    const { state, send } = useContractFunction(contract, functionName);

    const addAirlines = () =>{
        const address = airlineAddress.current.value;
        console.log(address);
        if(!utils.isAddress(address)){
            console.log(address);
            toast.error("请输入一个正确的地址值!");
        } else if(!airlineName.current.value) {
            toast.error("航空公司名称不能为空!")
        }else if(!delayRates.current.value || delayRates.current.value<0 || delayRates.current.value>=100) {
            toast.error("延误率不能为空且在0-100之间!")
        }else if(!cancelRates.current.value || cancelRates.current.value<0 || cancelRates.current.value>=100 ) {
            toast.error("取消率不能为空且在0-100之间!")
        }else{
           setFunctionName('addAirlines')
        }
    }

    const removeAirlines = () =>{
        if(!utils.isAddress(removeAirlineAddress.current.value)){
            toast.error("请输入一个正确的地址值!");
        } else if(!removeairlineName.current.value) {
            toast.error("航空公司名称不能为空!")
        }else{
            setFunctionName('removeAirlines')
        }
    }

    useEffect(() => {
        if(functionName === 'addAirlines'){
            console.log(airlineAddress.current.value, airlineName.current.value, delayRates.current.value * 100, cancelRates.current.value * 100);
            send(airlineName.current.value,airlineAddress.current.value,delayRates.current.value*100,cancelRates.current.value*100);
            setFunctionName('');
        } else if(functionName === 'removeAirlines'){
            send(removeAirlineAddress.current.value);
            setFunctionName('');
        } 
    }, [functionName, send]
    )

    useEffect(() => {
        if (state.errorMessage) {
            toast.error(state.errorMessage);
        }
    }, [state])
    return (
        <div>
             <div className="container position-relative wow fadeInUp" data-wow-delay="0.1s" style={{"marginTop" : "1rem"}}>
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="bg-light text-center p-5">
                        <h1 className="mb-4">注册航空公司</h1>
                            <div className="row g-3">
                            <div className="col-12 col-sm-6">
                                    <input ref={airlineName} type="text" className="form-control border-0" placeholder="航空公司名称" style={{height: "55px"}}/>
                                </div> 
                                <div className="col-12 col-sm-6">
                                    <input ref={airlineAddress} type="text" className="form-control border-0" placeholder="航空公司地址" style={{height: "55px"}}/>
                                </div> 
                                <div className="col-12 col-sm-6">
                                    <input ref={delayRates} type="text" className="form-control border-0" placeholder="航空公司延误率" style={{height: "55px"}}/>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <input ref={cancelRates} type="text" className="form-control border-0" placeholder="航空公司取消率" style={{height: "55px"}}/>
                                </div> 
                                <div className="col-12">
                                    <button  onClick={addAirlines} className="btn btn-primary w-100 py-3" type="submit">注册</button>
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        </div>  
               {/* 注册航空公司，将航空公司地址添加到航空公司dao */}
        

            {/*注销航空公司，将航空公司移除dao组织*/}
            <div className="container position-relative wow fadeInUp" data-wow-delay="0.1s" style={{"marginTop" : "1rem"}}>
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="bg-light text-center p-5">
                        <h1 className="mb-4">注销航空公司</h1>
                            <div className="row g-3">
                            <div className="col-12 col-sm-6">
                                    <input ref={removeairlineName} type="text" className="form-control border-0" placeholder="航空公司名称" style={{height: "55px"}}/>
                                </div> 
                                <div className="col-12 col-sm-6">
                                    <input ref={removeAirlineAddress} type="text" className="form-control border-0" placeholder="航空公司地址" style={{height: "55px"}}/>
                                </div> 
                                <div className="col-12">
                                    <button  onClick={removeAirlines} className="btn btn-primary w-100 py-3" type="submit">注销</button>
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
    );
}

export default AdminPage;