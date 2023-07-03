import { useRef, useState } from "react";
import axios from 'axios';
import FlightTicketBuy from "./FlightTicketBuy";  


const SelectFlight = ()=>{
    // 输入出发地、目的地、出发时间查询机票->
    const departplace = useRef()
    const arriveplace = useRef()
    const departtime = useRef()
    const [showFlightTicketBuy, setShowFlightTicketBuy] = useState(false);
    // let dataarr = [{flightNumber: 5 ,departuredate: '2023-6-6',scheduledArrivaldate: '2023-6-6',departureTime: '15:00',scheduledArrivalTime:'16:00',ticketPrice:'0.01',departurePoint:'成都',destinationPoint:'上海'}];
    const [dataarr,setDataArr] =useState([]);
    const handleSelectFlight = async() => {
        await selectFlight()
        setShowFlightTicketBuy(true);
      };
     
    const selectFlight=async ()=>{
    const departPlace = departplace.current.value;
    const arrivePlace = arriveplace.current.value;
    const departTime = new Date(departtime.current.value).getTime()/1000;
    await axios.post('http://localhost:8080/UserSelectFlight', {
      departPlace,
      arrivePlace,
      departTime
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
        <div className="container position-relative wow fadeInUp" data-wow-delay="0.1s" style={{"marginTop" : "1rem"}}>
        <div className="row justify-content-center">
            <div className="col-lg-8">
                <div className="bg-light text-center p-5">
                    <h1 className="mb-4">查询机票信息</h1>
                        <div className="row g-3">
                            <div className="col-12 col-sm-6">
                                <input ref={departplace} type="text" className="form-control border-0" placeholder="出发地" style={{height: "55px"}}/>
                            </div>
                            <div className="col-12 col-sm-6">
                                <input ref={arriveplace} type="text" className="form-control border-0" placeholder="目的地" style={{height: "55px"}}/>
                            </div>
                            <div className="col-12 col-sm-6">
                                <div className="date">
                                    <input ref={departtime } type="date" placeholder="预计出发时间"  style={{height: "55px"}}/>
                                </div>
                            </div>
                            <div className="col-12">
                                <button onClick={handleSelectFlight} className="btn btn-primary w-100 py-3" type="submit">查询</button>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    </div>  
    {showFlightTicketBuy && <FlightTicketBuy dataarr={dataarr} />}
</div>
    )
}

export default  SelectFlight