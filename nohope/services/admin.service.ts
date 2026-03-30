import { Issuer } from "@/model/issuers.model";
import Mongo from "../database/connect";
import { User } from "@/model/users.model";

interface AddIssuerDTO {
  name: string;
  address: string;
  isActive: boolean;
}

export class AdminService {
  async addIssuer(addIssuerDTO: AddIssuerDTO) {
    const { address } = addIssuerDTO;
    await Mongo.connect();
    const existingIssuer = await Issuer.findOne({ address });
    if (existingIssuer) return existingIssuer;

    const user = await User.findOne({ address });
    if (user) await User.updateOne({ address }, { role: "ISSUER" });
    else await User.create({ address, role: "ISSUER" });

    const issuer = await Issuer.create({ ...addIssuerDTO });
    return issuer;
  }

  async allIssuers() {
    await Mongo.connect();
    return await Issuer.find();
  }
}
