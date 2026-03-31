import { User } from "@/model/users.model";
import Mongo from "../database/connect";
import { Certificate } from "@/model/certificate.model";

interface CreateUserDTO {
  name: string | null;
  address: string;
  email: string | null;
  role: string;
}

export class UserService {
  async create(createUserDto: CreateUserDTO) {
    const { address } = createUserDto;
    await Mongo.connect();
    const existingUser = await User.findOne({ address });
    if (existingUser) return existingUser;

    const user = await User.create({ ...createUserDto });
    return user;
  }

  async findCertificate(certHash: string) {
    await Mongo.connect();
    return await Certificate.findOne({ certHash });
  }
}
