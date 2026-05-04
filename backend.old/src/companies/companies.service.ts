import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find({
      order: { created_at: 'ASC' },
    });
  }

  async findById(id: string): Promise<Company> {
    return this.companiesRepository.findOne({
      where: { id },
    });
  }

  async create(data: Partial<Company>): Promise<Company> {
    const company = this.companiesRepository.create(data);
    return this.companiesRepository.save(company);
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    await this.companiesRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.companiesRepository.delete(id);
  }
}
