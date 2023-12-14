import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AddressLike, BaseContract, isAddress } from "ethers";
import { ABI, ArtifactData, DeployResult, Libraries } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DefaultReturnType } from "../typechain/common";

type AttachedDeployedContract<ContractType extends BaseContract = BaseContract> = ContractType & {
  address: string;
  deployResult: DeployResult;
};

interface DeployArgs {
  from?: string;
  contract?: string | ArtifactData;
  libraries?: Libraries;
}

// verify:verify subtask args
interface VerifySubtaskArgs {
  contract: string;
  address: string;
  args: any[];
  libraries?: Libraries;
}

export async function deploy<ContractType extends BaseContract = BaseContract>(
  hre: HardhatRuntimeEnvironment,
  name: string,
  args: any[],
  { from: specificDeployer, contract, libraries = {} }: DeployArgs = {
    libraries: {},
  }
) {
  const from = specificDeployer || (await hre.getNamedAccounts()).deployer;
  const deployment: DeployResult = await hre.deployments.deploy(name, {
    from,
    args,
    contract,
    libraries,
    waitConfirmations: 1,
    log: true,
    skipIfAlreadyDeployed: true,
  });

  const attachedContract = (await hre.ethers.getContractAtWithSignerAddress<ContractType>(
    deployment.abi,
    deployment.address,
    from
  )) as unknown as AttachedDeployedContract<ContractType>;
  attachedContract.address = await attachedContract.getAddress();
  attachedContract.deployResult = deployment;

  return attachedContract;
}

export async function getDeploymentAddress(hre: HardhatRuntimeEnvironment, name: string) {
  const deployment = await hre.deployments.get(name);
  return deployment.address;
}

export async function getContract<ContractType extends BaseContract = BaseContract>(
  hre: HardhatRuntimeEnvironment,
  name: string,
  opts: {
    iface?: string | ABI;
    signer: HardhatEthersSigner | string;
    libraries?: Libraries;
  }
) {
  const deployment = await hre.deployments.get(name);
  const address = deployment.address;

  let abi = deployment.abi;
  if (opts.iface) {
    if (Array.isArray(opts.iface)) {
      abi = opts.iface;
    } else {
      const deployment = await hre.deployments.get(opts.iface);
      abi = deployment.abi;
    }
  }

  let signer: HardhatEthersSigner;
  if (typeof opts.signer === "string") {
    if (isAddress(opts.signer)) {
      signer = await hre.ethers.provider.getSigner(opts.signer);
    } else {
      const namedAccounts = await hre.getNamedAccounts();
      signer = await hre.ethers.provider.getSigner(namedAccounts[opts.signer]);
    }
  } else {
    signer = opts.signer;
  }

  const contract = (await hre.ethers.getContractAt(abi, address, signer)) as unknown as ContractType & {
    address: string;
  };
  contract.address = await contract.getAddress();

  return contract;
}

export async function verifyContract(
  hre: HardhatRuntimeEnvironment,
  { address, args, contract, libraries }: VerifySubtaskArgs
) {
  if (process.env.VERIFY_CONTRACTS === "1") {
    console.log(`Verify contract ${address} (as ${contract}) with ${args.length} arguments...`);
    await hre.run("verify:verify", { address, constructorArguments: args, contract, libraries });
  }
}

export async function getSafeContractProperty<T extends DefaultReturnType<any>>(
  method: Promise<T>,
  defaultValue: T
): Promise<T>;
export async function getSafeContractProperty<T extends DefaultReturnType<any>>(
  method: Promise<T>,
  defaultValue?: undefined
): Promise<T | null>;
export async function getSafeContractProperty<T extends DefaultReturnType<any>>(
  method: Promise<T>,
  defaultValue?: T
): Promise<T | null> {
  try {
    return await method;
  } catch (err) {
    if ((err as any)?.value === "0x" && (err as any)?.code === "BAD_DATA") {
      return defaultValue === undefined ? null : defaultValue;
    }
    throw err;
  }
}

export async function isContract(provider: HardhatEthersProvider, address: AddressLike) {
  return (await provider.getCode(address)) !== "0x";
}

export async function isUnderlyingTokenContract(
  provider: HardhatEthersProvider,
  cToken: string,
  address: string
) {
  if (isAddress(address) && (await isContract(provider, address))) {
    return address;
  } else {
    throw new Error(`User-defined underlying token for ${cToken}: ${address} is not a contract`);
  }
}
