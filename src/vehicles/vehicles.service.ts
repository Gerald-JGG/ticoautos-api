import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle, VehicleDocument, VehicleStatus } from './vehicle.schema';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleFilterDto,
} from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(
    createVehicleDto: CreateVehicleDto,
    ownerId: string,
  ): Promise<VehicleDocument> {
    const vehicle = new this.vehicleModel({
      ...createVehicleDto,
      owner: new Types.ObjectId(ownerId),
    });
    return vehicle.save();
  }

  async findAll(filters: VehicleFilterDto) {
    const query: any = {};

    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.brand) {
      query.brand = { $regex: filters.brand, $options: 'i' };
    }
    if (filters.model) {
      query.model = { $regex: filters.model, $options: 'i' };
    }
    if (filters.minYear || filters.maxYear) {
      query.year = {};
      if (filters.minYear) query.year.$gte = filters.minYear;
      if (filters.maxYear) query.year.$lte = filters.maxYear;
    }
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      this.vehicleModel
        .find(query)
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.vehicleModel.countDocuments(query),
    ]);

    return {
      data: vehicles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<VehicleDocument> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Vehicle not found');

    const vehicle = await this.vehicleModel
      .findById(id)
      .populate('owner', 'name email phone');

    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
    userId: string,
  ): Promise<VehicleDocument> {
    // Use findById (no populate) for ownership check so owner is a raw ObjectId
    const vehicle = await this.vehicleModel.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    this.checkOwnership(vehicle, userId);

    const updated = await this.vehicleModel
      .findByIdAndUpdate(id, updateVehicleDto, { new: true })
      .populate('owner', 'name email phone');

    if (!updated) throw new NotFoundException('Vehicle not found');
    return updated;
  }

  async markAsSold(id: string, userId: string): Promise<VehicleDocument> {
    // Use findById (no populate) for ownership check so owner is a raw ObjectId
    const vehicle = await this.vehicleModel.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    this.checkOwnership(vehicle, userId);

    const updated = await this.vehicleModel
      .findByIdAndUpdate(id, { status: VehicleStatus.SOLD }, { new: true })
      .populate('owner', 'name email phone');

    if (!updated) throw new NotFoundException('Vehicle not found');
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Use findById (no populate) for ownership check so owner is a raw ObjectId
    const vehicle = await this.vehicleModel.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    this.checkOwnership(vehicle, userId);
    await this.vehicleModel.findByIdAndDelete(id);
  }

  async findByOwner(ownerId: string) {
    return this.vehicleModel
      .find({ owner: new Types.ObjectId(ownerId) })
      .sort({ createdAt: -1 });
  }

  private checkOwnership(vehicle: VehicleDocument, userId: string): void {
    if (vehicle.owner.toString() !== userId) {
      throw new ForbiddenException('You are not the owner of this vehicle');
    }
  }
}