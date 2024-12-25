const Web3 = require("web3");
const BigNumber = require("bignumber.js");
const { expect } = require("chai");

const network = require(`../network/${process.env.npm_lifecycle_event.split(":")[1]
  }.json`);

const web3 = new Web3();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const KEY = network.contracts.Key.proxy;
const KEY_ID = 0;

const COMMISSION = {
  rate: 1000,
  receiver: network.accounts[0].address,
};

describe("DmtpTech", () => {
  async function getContract(type) {
    const DmtpTech = await ethers.getContractFactory("DmtpTech");
    const DmtpTechContract = await DmtpTech.attach(
      network.contracts.DmtpTech.proxy
    );

    const Key = await ethers.getContractFactory("Key");
    const KeyContract = await Key.attach(network.contracts.Key.proxy);

    if (type == "DmtpTech") {
      return DmtpTechContract;
    }

    if (type == "Key") {
      return KeyContract;
    }

    return {
      DmtpTech: DmtpTechContract,
      Key: KeyContract,
    };
  }
  describe("Commission", () => {
    //  it(`should update commission`, async () => {
    //    const contract = await DmtpTech.at(network.contracts.DmtpTech.proxy);
    //    const commission = await contract.commission.call();
    //    if (commission.rate.toString() == COMMISSION.rate) {
    //      return true;
    //    }
    //    console.log("commission updating...");
    //    await contract.setCommission(COMMISSION.rate, COMMISSION.receiver);
    //    assert.notEqual(
    //      commission.rate.toNumber(),
    //      COMMISSION.rate,
    //      "update the commission successfully"
    //    );
    //  });
    //    it(`should return the commission`, async () => {
    //      const contract = await getContract("DmtpTech");
    //      const commission = await contract.commission.call();
    //
    //      const message = `Commission: ${commission.rate.toString()}`;
    //      console.log(message);
    //      expect(commission.rate.toNumber()).to.equal(COMMISSION.rate);
    //    });
  });
  describe("Signer", () => {
    // it(`should update the signer`, async () => {
    //   const contract = await DmtpTech.at(network.contracts.DmtpTech.proxy);
    //   const signer = await contract.signer.call();
    //   if (
    //     signer.toString() &&
    //     signer.toString().toLowerCase() == SIGNER.address.toLowerCase()
    //   ) {
    //     return true;
    //   }
    //   console.log(
    //     "signer updating...",
    //     signer.toString(),
    //     SIGNER.address == signer.toString()
    //   );
    //   await contract.setSigner(SIGNER.address);
    //   assert.notEqual(
    //     signer.toString(),
    //     SIGNER.address,
    //     "update the signer successfully"
    //   );
    // });
    it(`should return a signer`, async () => {
      const contract = await getContract("DmtpTech");
      const signer = await contract.signer.call();

      const message = `Signer: ${signer.toString()}`;
      console.log(message);
    });
  });
  describe("Key", () => {
    // it(`should update key contract`, async () => {
    //   const contract = await DmtpTech.at(network.contracts.DmtpTech.proxy);
    //   const key = await contract.key.call();
    //   if (key.toString() == KEY) {
    //     return true;
    //   }
    //   console.log("key updating...");
    //   await contract.setKeyContract(KEY);

    //   assert.notEqual(key.toString(), KEY, "update the key successfully");
    // });
    it(`should return value of a config for checking whether address is in whitelist`, async () => {
      const contract = await getContract("DmtpTech");
      const result = await contract.needToCheckWhitelist.call();

      const message = `config for checking whether address is in whitelist: ${result.toString()}`;
      console.log(message);
    });
    //    it(`should update config for for checking whether address is in whitelist`, async () => {
    //      const contract = await DmtpTech.at(network.contracts.DmtpTech.proxy);
    //      const result = await contract.needToCheckWhitelist.call();
    //      if (result == true) {
    //        return true;
    //      }
    //      console.log("config for checking whitelist updating...");
    //      await contract.setNeedToCheckWhitelist(true);
    //
    //      assert.equal(
    //        result,
    //        true,
    //        "update the config for whitelist successfully"
    //      );
    //    });
    it(`should return key contract address`, async () => {
      const contract = await getContract("DmtpTech");
      const key = await contract.key.call();

      const message = `Key: ${key.toString()}`;
      console.log(message);
    });
    it(`should buy a key for a friend`, async () => {
      const contract = await getContract("DmtpTech");
      const [owner, signer, normal] = await ethers.getSigners();

      const result = await contract.priceWithCommission(KEY_ID);

      await contract.buyKeyFor(KEY_ID, normal.address, {
        value: result.payout.toString(),
      });
    });
    // it(`should buy a key`, async () => {
    //   const contract = await getContract("DmtpTech");
    //   const [owner, signer, normal] = await ethers.getSigners();

    //   const result = await contract.priceWithCommission(KEY_ID);

    //   await contract.connect(normal).buyKey(KEY_ID, {
    //     value: result.payout.toString(),
    //   });
    // });
    //    it(`should sell a key`, async () => {
    //      const contract = await getContract("DmtpTech");
    //
    //      const keySC = await getContract("Key");
    //
    //      const [owner, signer, normal] = await ethers.getSigners();
    //
    //      const isApprovedForAll = await keySC.isApprovedForAll(
    //        normal.address,
    //        network.contracts.DmtpTech.proxy
    //      );
    //      if (!isApprovedForAll) {
    //        await keySC
    //          .connect(normal)
    //          .setApprovalForAll(network.contracts.DmtpTech.proxy, true);
    //      }
    //
    //      const result = await contract.sellPriceWithCommission(KEY_ID);
    //      await contract.connect(normal).sellKey(KEY_ID, result.price.toString());
    //    });
     it(`should generate a key`, async () => {
       const contract = await getContract("DmtpTech");
       const [owner, signer, normal] = await ethers.getSigners();

       const generated = await contract.generated(normal.address);
       console.log("generated: ", generated, generated.toString());

       if (new BigNumber(generated.toString()).toNumber() > 0) {
         return true;
       }

       const hash = web3.extend.utils.soliditySha3(
         { t: "address", v: normal.address },
         { t: "uint", v: 421614 },
         {
           t: "address",
           v: network.contracts.DmtpTech.proxy,
         }
       );

       console.log("hash: ", hash, signer.privateKey, signer.address);

       const signature = String(
         await signer.signMessage(ethers.getBytes(hash))
       );
       console.log("signature: ", signature);

       await contract.connect(normal).generateKey(signature);
     });
    it(`should check users issued keys`, async () => {
      const contract = await getContract("DmtpTech");

      const [owner] = await ethers.getSigners();

      console.log("owner: ", owner.address);
      const result = await contract.generated(owner.address);

      const message = `whether users have issued a key: ${result}`;
      console.log(message);
    });
    it(`should get price of a key`, async () => {
      const contract = await getContract("Key");

      const price = await contract.priceOf(KEY_ID);
      console.log("price: ", price.toString());
    });
    // it(`should get sell  price of a key`, async () => {
    //   const contract = await getContract("Key");

    //   const price = await contract.sellPriceOf(KEY_ID);
    //   console.log("price: ", price.toString());
    // });
    it(`should return total supply  of a key`, async () => {
      const contract = await getContract("Key");

      const result = await contract.totalSupply(KEY_ID);
      console.log("totalSupply: ", result.toString());
    });

    it(`should return price with commission of a key`, async () => {
      const contract = await getContract("DmtpTech");

      const result = await contract.priceWithCommission(KEY_ID);
      console.log(
        "totalSupply: ",
        result.price.toString(),
        result.fee.toString(),
        result.payout.toString()
      );
    });
  });
});
