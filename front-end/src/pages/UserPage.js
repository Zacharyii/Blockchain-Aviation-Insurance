import ReturnTicket from "./UserSelectPage/ReturnTicket";  
import SelectFlightPage from "./UserSelectPage/SelectFlightPage";  
import axios from 'axios';
import { useEthers } from "@usedapp/core";
import { useRef,useState,useEffect } from 'react';




const UserPage = () => {
  const { account } = useEthers();

// 流程：输入出发地、目的地、出发时间查询机票->购买机票:输入身份证、座位号->购买保险：选择保险类型、输入身份证号->查看自己购买的机票和保险（可退票）
const [dataarr, setDataArr] = useState(null);  
const [choose, setActiveButton] = useState(null);  
  const handleButtonClick = (choose) => {  
    setActiveButton(choose);  
  };

  const selectFlight=async ()=>{
    await axios.post('http://localhost:8080/UserSelectTransactions', {
     account
    }, {withCredentials: true}) 
    .then(response => {
        let data =response.data;
      // 处理响应数据
      setDataArr(data.data);
      console.log(dataarr);
    })
    .catch(error => {
      // 处理错误
      console.error(error);
    });
} 

  return (  
    <div>
    <div className="container-xxl py-5">
  <div className="container">
      <div className="row g-4">
          <div className="col-lg-4 col-md-6 service-item-top wow fadeInUp" data-wow-delay="0.1s">
              <div className="overflow-hidden">
                  <img className="img-fluid w-100 h-100" src="img/service-1.jpg" alt=""/>
              </div>
              <div className="d-flex align-items-center justify-content-between bg-light p-4">
                  
                  <h5 className="text-truncate me-3 mb-0">查询航班</h5>
                  <a className="btn btn-square btn-outline-primary border-2 border-white flex-shrink-0" onClick={
            (e) =>{e.preventDefault(); handleButtonClick(0)}
                    }  
                    ><i className="fa fa-arrow-right"></i></a>
              </div>
          </div>
          <div className="col-lg-4 col-md-6 service-item-top wow fadeInUp" data-wow-delay="0.5s">
              <div className="overflow-hidden">
                  <img className="img-fluid w-100 h-100" src="img/service-3.jpg" alt=""/>
              </div>
              <div className="d-flex align-items-center justify-content-between bg-light p-4">
                  <h5 className="text-truncate me-3 mb-0">查询交易记录</h5>
                  <a className="btn btn-square btn-outline-primary border-2 border-white flex-shrink-0" onClick={
                    async(e) => {e.preventDefault();await selectFlight(); handleButtonClick(1)}
                  } href=""><i className="fa fa-arrow-right"></i></a>
              </div>
          </div>
      </div>
  </div>
</div> 
    {choose === 0 && <SelectFlightPage/>}  
    {choose === 1 && <ReturnTicket dataarr={dataarr}/>}  
  </div>  
  );  
};

export default UserPage;