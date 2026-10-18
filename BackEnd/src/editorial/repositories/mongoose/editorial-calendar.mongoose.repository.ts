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
        projectId: new (Types.ObjectId as any)(projectId),
        isActive: { $ne: false },
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
        isActive: { $ne: false },
      })
      .lean()
      .exec();
    return calendar as unknown as IEditorialCalendar | null;
  }

  async create(data: ICreateEditorialCalendar): Promise<IEditorialCalendar> {
    const mapped: Record<string, unknown> = {
      projectId: new (Types.ObjectId as any)(data.projectId),
      editorialVersionId: new (Types.ObjectId as any)(data.editorialVersionId),
      name: data.name,
      period: {
        type: data.period.type,
        label: data.period.label,
        startDate: data.period.startDate,
        endDate: data.period.endDate,
      },
      platforms: data.platforms,
      capacity: {
        reelsPerWeek: data.capacity.reelsPerWeek,
        longVideosPerWeek: data.capacity.longVideosPerWeek,
        carouselsPerWeek: data.capacity.carouselsPerWeek,
        staticPostsPerWeek: data.capacity.staticPostsPerWeek,
        livesPerWeek: data.capacity.livesPerWeek,
        storySequencesPerDay: data.capacity.storySequencesPerDay,
      },
      objective: data.objective,
      days: data.days ?? [],
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
    if (data.name !== undefined) set['name'] = data.name;
    if (data.status !== undefined) set['status'] = data.status;
    if (data.editorialVersionId !== undefined)
      set['editorialVersionId'] = new (Types.ObjectId as any)(
        data.editorialVersionId,
      );
    if (data.objective !== undefined) set['objective'] = data.objective;
    if (data.capacity !== undefined) {
      set['capacity.reelsPerWeek'] = data.capacity.reelsPerWeek;
      set['capacity.longVideosPerWeek'] = data.capacity.longVideosPerWeek;
      set['capacity.carouselsPerWeek'] = data.capacity.carouselsPerWeek;
      set['capacity.staticPostsPerWeek'] = data.capacity.staticPostsPerWeek;
      set['capacity.livesPerWeek'] = data.capacity.livesPerWeek;
      set['capacity.storySequencesPerDay'] = data.capacity.storySequencesPerDay;
    }
    if (data.reviewSuggestions !== undefined)
      set['reviewSuggestions'] = data.reviewSuggestions;

    const updated = await this.calendarModel
      .findOneAndUpdate(
        {
          _id: new (Types.ObjectId as any)(id),
          isActive: { $ne: false },
        },
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
        { $set: { isActive: false } },
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
    for (const day of doc.days || []) {
      for (let i = 0; i < (day.items || []).length; i++) {
        const item = day.items[i] as unknown as Record<string, unknown>;
        const itemDocId = (item._id || item.id)?.toString();
        if (itemDocId === itemObjectId.toString()) {
          if (data.provisionalName !== undefined)
            item.provisionalName = data.provisionalName;
          if (data.theme !== undefined) item.theme = data.theme;
          if (data.painDesireObjection !== undefined)
            item.painDesireObjection = data.painDesireObjection;
          if (data.suggestedTime !== undefined)
            item.suggestedTime = data.suggestedTime;
          if (data.observations !== undefined)
            item.observations = data.observations;
          if (data.referenceUrl !== undefined)
            item.referenceUrl = data.referenceUrl;
          if (data.exampleUrl !== undefined) item.exampleUrl = data.exampleUrl;
          if (data.pillar !== undefined) item.pillar = data.pillar;
          if (data.strategicObjective !== undefined)
            item.strategicObjective = data.strategicObjective;
          if (data.status !== undefined) item.status = data.status;
          if (data.retinaType !== undefined) item.retinaType = data.retinaType;
          if (data.platforms !== undefined) item.platforms = data.platforms;
          if (data.objective !== undefined) item.objective = data.objective;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) return null;

    doc.markModified('days' as any);
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialCalendar;
  }

  async addReviewSuggestions(
    calendarId: string,
    suggestions: IReviewSuggestion[],
  ): Promise<IEditorialCalendar | null> {
    const mapped = suggestions.map((s) => ({
      type: s.type,
      title: s.title,
      description: s.description,
      impact: s.impact,
    }));

    const updated = await this.calendarModel
      .findOneAndUpdate(
        { _id: new (Types.ObjectId as any)(calendarId) },
        { $set: { reviewSuggestions: mapped } },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialCalendar | null;
  }
}
