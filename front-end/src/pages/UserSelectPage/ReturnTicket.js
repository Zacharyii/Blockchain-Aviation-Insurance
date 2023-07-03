import { utils } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { useRef,useState,useEffect } from 'react';
import { ToastContainer,toast } from 'react-toastify';
import { Web3Provider } from "@ethersproject/providers";
import FTcontractInterface from '../../artifacts/contracts/Flight.sol/Flight.json'
import IAcontractInterface from '../../artifacts/contracts/Insurance.sol/Insurance.json'

const ReturnTicketdata =({dataarr})=>{
  console.log("dataarr",dataarr);
  const FTcontractAddress = "0x91d9137F81C1B04e9f5Fc2c77F5eA45E589C31dF";
  const IAcontractAddress = "0x9BeF27A51039DDbc2EBbCB5F6d7FE1078035aE33";
  const FTcontractInterfaceABI = FTcontractInterface.abi;
  const IAcontractInterfaceABI = IAcontractInterface.abi;
  const provider = new Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const FTcontract = new Contract(FTcontractAddress, FTcontractInterfaceABI,signer);
  const IAcontract = new Contract(IAcontractAddress, IAcontractInterfaceABI,signer);

    // 查看自己购买的机票和保险（可退票）
    const [DealyInsurancePrice,setDealyInsurancePrice] = useState(0);
    const [CancelInsurancePrice,setCancelInsurancePrice] = useState(0);
  
  
    let number;
    let idnumber;
    let seatnumber;
    let _DealyInsurancePrice;
    let _CancelInsurancePrice;
    let _insurance = 0;
    let i = 0;
    // const dataarr = [{flightNumber: 5 ,departuredate: '2023-6-6',scheduledArrivaldate: '2023-6-6',departureTime: '15:00',scheduledArrivalTime:'16:00',ticketPrice:'0.01',departurePoint:'成都',destinationPoint:'上海',insurance:0,idNumber:'123456789123456789',seatnumber:'1'}]
    const handlerefund = async() => {
      await InsuranceRefund();
      TicketRefund();
    };
   
  
  
function getPrice(flightNumber) {
  return IAcontract.getInsurancePrice(flightNumber)
    .then(([delayPrice, cancelPrice]) => {
      setDealyInsurancePrice(delayPrice / Math.pow(10,18));
      setCancelInsurancePrice(cancelPrice /  Math.pow(10,18));
      console.log(DealyInsurancePrice,CancelInsurancePrice);
    }
    ); 
}
  
      const setdata = (FN,ID,SN,IA)=>{
        number = FN;
        idnumber = ID;
        seatnumber = SN;
        _insurance = IA;
           console.log("number:" + number,"idnumber:" + idnumber,"setnumber:" + seatnumber ,"insurance:" + _insurance);
      }
      const seitdata = (FN,ID,SN)=>{
        number = FN;
        idnumber = ID;
        seatnumber = SN;
           console.log("number:" + number,"idnumber:" + idnumber,"setnumber:" + seatnumber ,"insurance:" + _insurance);
      }
      const setprice = (DP,CP)=>{
        _DealyInsurancePrice = DP;
        _CancelInsurancePrice = CP;
        console.log("DealyInsurancePrice:" + _DealyInsurancePrice,"CancelInsurancePrice:" + _CancelInsurancePrice);
      }
      const TicketRefund = async()=>{
        if (!FTcontract) {
          console.error("合约对象为空！");
          return;
        }
        else{
          try{
            const result =  await FTcontract.refundTicket(
              number,
              seatnumber)
              console.log(result);
              alert('退回机票成功')
          }catch(error){
            console.log(error);
        toast.error('退回机票失败，请检查机票是否失效');
          }
        }
          
        }
        const InsuranceRefund = async()=>{
          if (!IAcontract) {
            console.error("合约对象为空！");
            return;
          }else if(_insurance == 0){
            alert('您未购买保险')
            return;
          }
          else{
            try{
              const result =  await IAcontract.refundInsurance(
                number,
                idnumber)
                console.log(result);
                alert('退回保险成功')
            }catch(error){
              console.log(error);
          toast.error('退回保险失败，请检查保险是否失效');
            }
          }
            
          }
          const InsuranceBuy = async()=>{
            if (!IAcontract) {
              console.error("合约对象为空！");
              return;
            }else if (_insurance === "0"){
              return
            }
            else if (_insurance === "1"){
              try{
                console.log(number,
                  _insurance,
                  idnumber);
                const result =  await IAcontract.buyInsurance(
                  number,
                  _insurance,
                  idnumber,{
                    value: utils.parseEther(_DealyInsurancePrice.toString())
                  })
                  console.log(result);
                  alert('购买延误险成功')
              }catch(error){
                console.log(error);
            toast.error("延误险购买失败，已购买延误险或机票已失效");
              }
            }else if (_insurance === "2"){
              try{
                console.log(number,
                  _insurance,
                  idnumber);
                const result =  await IAcontract.buyInsurance(
                  number,
                  _insurance,
                  idnumber,{
                    value: utils.parseEther(_CancelInsurancePrice.toString())
                  })
                  console.log(result);
                  alert('购买取消险成功')
              }catch(error){
                console.log(error);
            toast.error("取消险购买失败，已购买取消险或机票已失效");
              }
            }else if (_insurance === "3"){
              try{
                console.log(number,
                  _insurance,
                  idnumber);
                const result =  await IAcontract.buyInsurance(
                  number,
                  _insurance,
                  idnumber,{
                    value: utils.parseEther((_DealyInsurancePrice+_CancelInsurancePrice).toString())
                  })
                  console.log(result);
                  alert('购买取消险和延误险成功')
              }catch(error){
                console.log(error);
            toast.error("延误险或取消险购买失败，已购买延误险或取消险或机票已失效");
              }
            }
              
            }
    

    let TicketList = [];
            if(dataarr){
    dataarr.forEach(data => {
      const{flight_number ,company_name,departTime,scheduled_arrival_time,price,departPlace,arrivePlace,insurance_type,id_card,seat} = data;
      getPrice(flight_number);
      const companyname = company_name.substring(0, 2)
      let logo = '';
      if(companyname){
        logo = "./logos/"+companyname+".png"
      }   
          const departureTimeDate = new Date(departTime*1000);
      const arrivalTimeDate = new Date(scheduled_arrival_time*1000);
      const duration = Math.floor((scheduled_arrival_time - departTime)  / 60);
      let insuranceText;
  switch (insurance_type) {
    case 1:
      insuranceText = "购买延误险";
      break;
    case 2:
      insuranceText = "购买取消险";
      break;
    case 3:
      insuranceText = "购买延误险和取消险";
      break;
    default:
      insuranceText = "未购买保险";
      break;
  }
      TicketList.push(
        <div className="ticket" key={i}  style={{"marginTop" : "1rem"}}>
          <div className="header">
            <img src={logo} alt="Logo" className="logo" />
            <div className="number">{flight_number}</div>
          </div>
          <div className="times">
            <div className="departure-time">{departureTimeDate.getHours().toString().padStart(2, '0')}{':'}{departureTimeDate.getMinutes().toString().padStart(2, '0')}</div>
            <div className="duration">总时长: {duration} 分钟</div>
            <div className="arrival-time">{arrivalTimeDate.getHours().toString().padStart(2, '0')}{':'}{arrivalTimeDate.getMinutes().toString().padStart(2, '0')}</div>
          </div>
          <div className="places">
            <div className="departure-place">{departPlace}</div>
            <div className="arrival-place">{arrivePlace}</div>
          </div>
          <div className="arrival-place">价格：{'    '}{price / Math.pow(10,18)}{'ETH'}</div>
          <div className="col-12">
            购买保险类型:{insuranceText}
            <button onClick={()=>{setdata(flight_number,id_card,seat,insurance_type);handlerefund()}} className="btn btn-primary w-100 py-3" type="submit">退票</button>
            <button onClick={()=>{setdata(flight_number,id_card,seat,insurance_type);InsuranceRefund()}} className="btn btn-primary w-100 py-3" type="submit">退保险</button>
          </div>
          <div className="col-12">
            <label htmlFor="insurance-select">请选择保险类型:</label>
            <select  onChange={(e) =>{ _insurance = e.target.value;console.log(_insurance);}} className="form-select border-0" style={{height: "55px"}}>
                                        <option value="0">不购买保险</option>
                                        <option value="1">购买延误险:{'价格为'}{DealyInsurancePrice}{'ETH'}</option>
                                        <option value="2">购买取消险:{'价格为'}{CancelInsurancePrice}{'ETH'}</option>
                                        <option value="3">购买延误险和取消险{'价格为'}{DealyInsurancePrice+CancelInsurancePrice}{'ETH'}</option>
            </select>
              <button onClick={()=>{ seitdata(flight_number,id_card,seat);setprice(DealyInsurancePrice,CancelInsurancePrice);InsuranceBuy()}} className="btn btn-primary w-100 py-3" type="submit">购买保险</button>
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
      i++
    });}
    else{
      alert("您还未购买过机票或保险！")
      return <div><h1>您还未购买过机票或保险！</h1></div>
    }

return TicketList;
};

export default  ReturnTicketdata