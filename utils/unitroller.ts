import { HardhatRuntimeEnvironment } from "hardhat/types";
import UnitrollerComptrollerArtifact from "../artifacts/contracts/UnitrollerComptroller.sol/UnitrollerComptroller.json";
import { UnitrollerComptroller } from "../typechain";
import { getContract } from "./contracts";

export default async function getUnitroller(hre: HardhatRuntimeEnvironment) {
  return await getContract<UnitrollerComptroller>(hre, "Unitroller", {
    signer: "deployer",
    iface: UnitrollerComptrollerArtifact.abi,
  });
}
