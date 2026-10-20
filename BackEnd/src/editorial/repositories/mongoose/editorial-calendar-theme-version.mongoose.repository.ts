import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialCalendarThemeVersionRepository } from '../editorial-calendar-theme-version.repository';
import {
  IEditorialCalendarThemeVersion,
  ICreateEditorialCalendarThemeVersion,
} from '../../schemas/models/editorial-calendar-theme-version.interface';
import {
  EditorialCalendarThemeVersion,
  EditorialCalendarThemeVersionDocument,
} from '../../schemas/editorial-calendar-theme-version.schema';

const toObjectId = (id: string) => new (Types.ObjectId as any)(String(id));

@Injectable()
export class EditorialCalendarThemeVersionMongooseRepository implements EditorialCalendarThemeVersionRepository {
  constructor(
    @InjectModel(EditorialCalendarThemeVersion.name)
    private readonly versionModel: Model<EditorialCalendarThemeVersionDocument>,
  ) {}

  async findAllByCalendar(
    calendarId: string,
  ): Promise<IEditorialCalendarThemeVersion[]> {
    const versions = await this.versionModel
      .find({ calendarId: toObjectId(calendarId), isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return versions as unknown as IEditorialCalendarThemeVersion[];
  }

  async create(
    data: ICreateEditorialCalendarThemeVersion,
  ): Promise<IEditorialCalendarThemeVersion> {
    const doc = new this.versionModel({
      ...data,
      projectId: toObjectId(data.projectId),
      calendarId: toObjectId(data.calendarId),
      slots: data.slots.map((s) => ({
        calendarItemId: toObjectId(s.calendarItemId),
        theme: s.theme,
      })),
    });
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialCalendarThemeVersion;
  }
}
