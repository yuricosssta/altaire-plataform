import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialCalendarRepository } from '../editorial-calendar.repository';
import {
  IEditorialCalendar,
  ICreateEditorialCalendar,
  IUpdateEditorialCalendar,
  ICalendarItemUpdate,
  IReviewSuggestion,
} from '../../schemas/models/editorial-calendar.interface';
import {
  EditorialCalendar,
  EditorialCalendarDocument,
} from '../../schemas/editorial-calendar.schema';

@Injectable()
export class EditorialCalendarMongooseRepository implements EditorialCalendarRepository {
  constructor(
    @InjectModel(EditorialCalendar.name)
    private readonly calendarModel: Model<EditorialCalendarDocument>,
  ) {}

  async findAllByProject(projectId: string): Promise<IEditorialCalendar[]> {
    const calendars = await this.calendarModel
      .find({
        pid: new (Types.ObjectId as any)(projectId),
        ia: { $ne: false },
      })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return calendars as unknown as IEditorialCalendar[];
  }

  async findById(id: string): Promise<IEditorialCalendar | null> {
    const calendar = await this.calendarModel
      .findOne({
        _id: new (Types.ObjectId as any)(id),
        ia: { $ne: false },
      })
      .lean()
      .exec();
    return calendar as unknown as IEditorialCalendar | null;
  }

  async create(data: ICreateEditorialCalendar): Promise<IEditorialCalendar> {
    const mapped: Record<string, unknown> = {
      pid: new (Types.ObjectId as any)(data.projectId),
      evid: new (Types.ObjectId as any)(data.editorialVersionId),
      n: data.name,
      per: {
        tp: data.period.type,
        lb: data.period.label,
        sd: data.period.startDate,
        ed: data.period.endDate,
      },
      plf: data.platforms,
      cap: {
        rw: data.capacity.reelsPerWeek,
        lw: data.capacity.longVideosPerWeek,
        cw: data.capacity.carouselsPerWeek,
        sw: data.capacity.staticPostsPerWeek,
        lv: data.capacity.livesPerWeek,
        ss: data.capacity.storySequencesPerDay,
      },
      obj: data.objective,
      dys: data.days ?? [],
    };

    const doc = new this.calendarModel(mapped);
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialCalendar;
  }

  async update(
    id: string,
    data: IUpdateEditorialCalendar,
  ): Promise<IEditorialCalendar | null> {
    const set: Record<string, unknown> = {};
    if (data.name !== undefined) set['n'] = data.name;
    if (data.status !== undefined) set['st'] = data.status;
    if (data.editorialVersionId !== undefined)
      set['evid'] = new (Types.ObjectId as any)(data.editorialVersionId);
    if (data.objective !== undefined) set['obj'] = data.objective;
    if (data.capacity !== undefined) {
      set['cap.rw'] = data.capacity.reelsPerWeek;
      set['cap.lw'] = data.capacity.longVideosPerWeek;
      set['cap.cw'] = data.capacity.carouselsPerWeek;
      set['cap.sw'] = data.capacity.staticPostsPerWeek;
      set['cap.lv'] = data.capacity.livesPerWeek;
      set['cap.ss'] = data.capacity.storySequencesPerDay;
    }
    if (data.reviewSuggestions !== undefined)
      set['rv'] = data.reviewSuggestions;

    const updated = await this.calendarModel
      .findOneAndUpdate(
        { _id: new (Types.ObjectId as any)(id), ia: { $ne: false } },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialCalendar | null;
  }

  async softDelete(id: string): Promise<IEditorialCalendar | null> {
    const deleted = await this.calendarModel
      .findOneAndUpdate(
        { _id: new (Types.ObjectId as any)(id) },
        { $set: { ia: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted as unknown as IEditorialCalendar | null;
  }

  async updateItem(
    calendarId: string,
    itemId: string,
    data: ICalendarItemUpdate,
  ): Promise<IEditorialCalendar | null> {
    const doc = await this.calendarModel
      .findOne({ _id: new (Types.ObjectId as any)(calendarId) })
      .exec();
    if (!doc) return null;

    const itemObjectId = itemId.includes('new ObjectId')
      ? new (Types.ObjectId as any)(itemId)
      : new (Types.ObjectId as any)(itemId);

    let found = false;
    for (const day of (doc as any).dys || []) {
      for (let i = 0; i < (day.it || []).length; i++) {
        const item = day.it[i] as Record<string, unknown>;
        const itemDocId = (item._id || item.id)?.toString();
        if (itemDocId === itemObjectId.toString()) {
          if (data.provisionalName !== undefined)
            item.pn = data.provisionalName;
          if (data.theme !== undefined) item.th = data.theme;
          if (data.painDesireObjection !== undefined)
            item.pdo = data.painDesireObjection;
          if (data.suggestedTime !== undefined) item.stm = data.suggestedTime;
          if (data.observations !== undefined) item.ob = data.observations;
          if (data.referenceUrl !== undefined) item.ru = data.referenceUrl;
          if (data.exampleUrl !== undefined) item.eu = data.exampleUrl;
          if (data.pillar !== undefined) item.pl = data.pillar;
          if (data.strategicObjective !== undefined)
            item.so = data.strategicObjective;
          if (data.status !== undefined) item.sts = data.status;
          if (data.retinaType !== undefined) item.rt = data.retinaType;
          if (data.platforms !== undefined) item.plf = data.platforms;
          if (data.objective !== undefined) item.o = data.objective;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) return null;

    doc.markModified('dys' as any);
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialCalendar;
  }

  async addReviewSuggestions(
    calendarId: string,
    suggestions: IReviewSuggestion[],
  ): Promise<IEditorialCalendar | null> {
    const mapped = suggestions.map((s) => ({
      tp: s.type,
      t: s.title,
      d: s.description,
      im: s.impact,
    }));

    const updated = await this.calendarModel
      .findOneAndUpdate(
        { _id: new (Types.ObjectId as any)(calendarId) },
        { $set: { rv: mapped } },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialCalendar | null;
  }
}
