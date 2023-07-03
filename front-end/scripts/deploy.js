const hre = require("hardhat");

async function main() {
  const Airline = await hre.ethers.getContractFactory("Airline");
  const Flight = await hre.ethers.getContractFactory("Flight");
  const Insurance = await hre.ethers.getContractFactory("Insurance");

  const AirlineContract = await Airline.deploy();
  const FlightContract = await Flight.deploy();
  const InsuranceContract = await Insurance.deploy();

  await AirlineContract.deployed();
  await FlightContract.deployed();
  await InsuranceContract.deployed();

  console.log("AirlineContract is deployed to:", AirlineContract.address);
  console.log("FlightContract is deployed to:", FlightContract.address);
  console.log("InsuranceContract is deployed to:", InsuranceContract.address);
  
  // Set the addresses of the other contracts in each contract
  await AirlineContract.setAddress(FlightContract.address, InsuranceContract.address);
  await FlightContract.setAddress(AirlineContract.address, InsuranceContract.address);
  await InsuranceContract.setAddress(AirlineContract.address, FlightContract.address);
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
