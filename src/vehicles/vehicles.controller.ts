import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto, VehicleFilterDto } from './dto/vehicle.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/user.schema';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  /**
   * GET /api/vehicles
   * Public - List vehicles with filters and pagination
   * Example: GET /api/vehicles?brand=Toyota&minPrice=5000&maxPrice=15000&page=1&limit=10
   */
  @Get()
  findAll(@Query() filters: VehicleFilterDto) {
    return this.vehiclesService.findAll(filters);
  }

  /**
   * GET /api/vehicles/my
   * Private - Get authenticated user's own vehicles
   */
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyVehicles(@CurrentUser() user: UserDocument) {
    return this.vehiclesService.findByOwner(user._id.toString());
  }

  /**
   * GET /api/vehicles/:id
   * Public - Get vehicle detail including owner basic info
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  /**
   * POST /api/vehicles
   * Private - Create a new vehicle listing
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.vehiclesService.create(createVehicleDto, user._id.toString());
  }

  /**
   * PUT /api/vehicles/:id
   * Private - Update vehicle info (owner only)
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, user._id.toString());
  }

  /**
   * PATCH /api/vehicles/:id/sold
   * Private - Mark vehicle as sold (owner only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/sold')
  markAsSold(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.vehiclesService.markAsSold(id, user._id.toString());
  }

  /**
   * DELETE /api/vehicles/:id
   * Private - Delete vehicle (owner only)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.vehiclesService.remove(id, user._id.toString());
  }
}
