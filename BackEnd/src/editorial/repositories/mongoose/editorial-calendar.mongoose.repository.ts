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

const toObjectId = (id: string) => new (Types.ObjectId as any)(String(id));

@Injectable()
export class EditorialCalendarMongooseRepository implements EditorialCalendarRepository {
  constructor(
    @InjectModel(EditorialCalendar.name)
    private readonly calendarModel: Model<EditorialCalendarDocument>,
  ) {}

  async findAllByProject(projectId: string): Promise<IEditorialCalendar[]> {
    if (!(Types.ObjectId as any).isValid(projectId)) return [];
    const calendars = await this.calendarModel
      .find({
        projectId: toObjectId(projectId),
        isActive: { $ne: false },
      })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return calendars as unknown as IEditorialCalendar[];
  }

  async findAllByProjects(projectIds: string[]): Promise<IEditorialCalendar[]> {
    const validIds = projectIds
      .filter((pid) => (Types.ObjectId as any).isValid(pid))
      .map(toObjectId);
    if (validIds.length === 0) return [];
    const calendars = await this.calendarModel
      .find({
        projectId: { $in: validIds },
        isActive: { $ne: false },
      })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return calendars as unknown as IEditorialCalendar[];
  }

  async findById(id: string): Promise<IEditorialCalendar | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const calendar = await this.calendarModel
      .findOne({
        _id: toObjectId(id),
        isActive: { $ne: false },
      })
      .lean()
      .exec();
    return calendar as unknown as IEditorialCalendar | null;
  }

  async create(data: ICreateEditorialCalendar): Promise<IEditorialCalendar> {
    const mapped: Record<string, unknown> = {
      projectId: toObjectId(data.projectId),
      editorialVersionId: (Types.ObjectId as any).isValid(
        data.editorialVersionId,
      )
        ? toObjectId(data.editorialVersionId)
        : toObjectId(data.projectId),
      name: data.name,
      period: {
        type: data.period.type,
        label: data.period.label,
        startDate: data.period.startDate,
        endDate: data.period.endDate,
      },
      periodLabel: data.periodLabel ?? data.period.label,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      mainObjective: data.mainObjective,
      linkedLineName: data.linkedLineName,
      platforms: data.platforms,
      capacity: {
        reelsPerWeek: data.capacity.reelsPerWeek,
        longVideosPerWeek: data.capacity.longVideosPerWeek,
        carouselsPerWeek: data.capacity.carouselsPerWeek,
        staticPostsPerWeek: data.capacity.staticPostsPerWeek,
        livesPerWeek: data.capacity.livesPerWeek,
        storySequencesPerDay: data.capacity.storySequencesPerDay,
        storiesPerSequence: data.capacity.storiesPerSequence ?? 5,
      },
      weeklyCapacity: data.weeklyCapacity,
      objective: data.objective,
      status: data.status ?? 'active',
      days: data.days ?? [],
      slots: data.slots ?? [],
      reviewSuggestions: data.reviewSuggestions ?? [],
    };

    const doc = new this.calendarModel(mapped);
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialCalendar;
  }

  async update(
    id: string,
    data: IUpdateEditorialCalendar,
  ): Promise<IEditorialCalendar | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const set: Record<string, unknown> = {};
    if (data.name !== undefined) set['name'] = data.name;
    if (data.status !== undefined) set['status'] = data.status;
    if (
      data.editorialVersionId !== undefined &&
      (Types.ObjectId as any).isValid(data.editorialVersionId)
    ) {
      set['editorialVersionId'] = toObjectId(data.editorialVersionId);
    }
    if (data.objective !== undefined) set['objective'] = data.objective;
    if (data.periodLabel !== undefined) set['periodLabel'] = data.periodLabel;
    if (data.periodStart !== undefined) set['periodStart'] = data.periodStart;
    if (data.periodEnd !== undefined) set['periodEnd'] = data.periodEnd;
    if (data.mainObjective !== undefined)
      set['mainObjective'] = data.mainObjective;
    if (data.linkedLineName !== undefined)
      set['linkedLineName'] = data.linkedLineName;
    if (data.platforms !== undefined) set['platforms'] = data.platforms;
    if (data.weeklyCapacity !== undefined)
      set['weeklyCapacity'] = data.weeklyCapacity;
    if (data.slots !== undefined) set['slots'] = data.slots;
    if (data.capacity !== undefined) {
      set['capacity.reelsPerWeek'] = data.capacity.reelsPerWeek;
      set['capacity.longVideosPerWeek'] = data.capacity.longVideosPerWeek;
      set['capacity.carouselsPerWeek'] = data.capacity.carouselsPerWeek;
      set['capacity.staticPostsPerWeek'] = data.capacity.staticPostsPerWeek;
      set['capacity.livesPerWeek'] = data.capacity.livesPerWeek;
      set['capacity.storySequencesPerDay'] = data.capacity.storySequencesPerDay;
      if (data.capacity.storiesPerSequence !== undefined) {
        set['capacity.storiesPerSequence'] = data.capacity.storiesPerSequence;
      }
    }
    if (data.reviewSuggestions !== undefined)
      set['reviewSuggestions'] = data.reviewSuggestions;

    const updated = await this.calendarModel
      .findOneAndUpdate(
        {
          _id: toObjectId(id),
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
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const deleted = await this.calendarModel
      .findOneAndUpdate(
        { _id: toObjectId(id) },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted as unknown as IEditorialCalendar | null;
  }

  async addSlot(
    calendarId: string,
    slot: Record<string, unknown>,
  ): Promise<IEditorialCalendar | null> {
    if (!(Types.ObjectId as any).isValid(calendarId)) return null;
    const updated = await this.calendarModel
      .findOneAndUpdate(
        { _id: toObjectId(calendarId), isActive: { $ne: false } },
        { $push: { slots: slot } },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialCalendar | null;
  }

  async updateItem(
    calendarId: string,
    itemId: string,
    data: ICalendarItemUpdate,
  ): Promise<IEditorialCalendar | null> {
    if (!(Types.ObjectId as any).isValid(calendarId)) return null;
    const doc = await this.calendarModel
      .findOne({ _id: toObjectId(calendarId), isActive: { $ne: false } })
      .exec();
    if (!doc) return null;

    let found = false;

    // 1. Check rich slots array (CalendarioEditorialModule)
    if (Array.isArray(doc.slots) && doc.slots.length > 0) {
      const slotIndex = doc.slots.findIndex((s) => {
        const slot = s as Record<string, unknown>;
        return (
          String(slot.id || '') === String(itemId) ||
          String(slot._id || '') === String(itemId)
        );
      });
      if (slotIndex >= 0) {
        const current = doc.slots[slotIndex] as Record<string, unknown>;
        const patched: Record<string, unknown> = { ...current };
        for (const [k, v] of Object.entries(data)) {
          if (v !== undefined) patched[k] = v;
        }
        // Keep friendly aliases synchronized
        if (data.theme !== undefined && data.mainTheme === undefined) {
          patched.mainTheme = data.theme;
        }
        if (data.mainTheme !== undefined && data.theme === undefined) {
          patched.theme = data.mainTheme;
        }
        if (
          data.provisionalName !== undefined &&
          data.provisionalTitle === undefined
        ) {
          patched.provisionalTitle = data.provisionalName;
        }
        if (
          data.provisionalTitle !== undefined &&
          data.provisionalName === undefined
        ) {
          patched.provisionalName = data.provisionalTitle;
        }
        doc.slots[slotIndex] = patched;
        doc.markModified('slots' as any);
        found = true;
      }
    }

    // 2. Check legacy days[].items[]
    if ((Types.ObjectId as any).isValid(itemId)) {
      const itemObjectId = toObjectId(itemId);
      for (const day of doc.days || []) {
        for (let i = 0; i < (day.items || []).length; i++) {
          const item = day.items[i] as unknown as Record<string, unknown>;
          const itemDocId = (item._id || item.id)?.toString();
          if (itemDocId === itemObjectId.toString()) {
            if (
              data.provisionalName !== undefined ||
              data.provisionalTitle !== undefined
            )
              item.provisionalName =
                data.provisionalName ?? data.provisionalTitle;
            if (data.theme !== undefined || data.mainTheme !== undefined)
              item.theme = data.theme ?? data.mainTheme;
            if (
              data.painDesireObjection !== undefined ||
              data.icpPainDesireOrObjection !== undefined
            )
              item.painDesireObjection =
                data.painDesireObjection ?? data.icpPainDesireOrObjection;
            if (
              data.suggestedTime !== undefined ||
              data.scheduledTime !== undefined
            )
              item.suggestedTime = data.suggestedTime ?? data.scheduledTime;
            if (
              data.observations !== undefined ||
              data.executionNotes !== undefined
            )
              item.observations = data.observations ?? data.executionNotes;
            if (
              data.referenceUrl !== undefined ||
              data.referenceLink !== undefined
            )
              item.referenceUrl = data.referenceUrl ?? data.referenceLink;
            if (data.exampleUrl !== undefined)
              item.exampleUrl = data.exampleUrl;
            if (data.pillar !== undefined || data.editorialPillar !== undefined)
              item.pillar = data.pillar ?? data.editorialPillar;
            if (
              data.strategicObjective !== undefined ||
              data.primaryObjective !== undefined
            )
              item.strategicObjective =
                data.strategicObjective ?? data.primaryObjective;
            if (data.status !== undefined) item.status = data.status;
            if (data.retinaType !== undefined)
              item.retinaType = data.retinaType;
            if (data.platforms !== undefined) item.platforms = data.platforms;
            if (data.objective !== undefined) item.objective = data.objective;
            doc.markModified('days' as any);
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    if (!found) return null;

    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialCalendar;
  }

  async deleteItem(
    calendarId: string,
    itemId: string,
  ): Promise<IEditorialCalendar | null> {
    if (!(Types.ObjectId as any).isValid(calendarId)) return null;
    const doc = await this.calendarModel
      .findOne({ _id: toObjectId(calendarId), isActive: { $ne: false } })
      .exec();
    if (!doc) return null;

    let changed = false;
    if (Array.isArray(doc.slots) && doc.slots.length > 0) {
      const nextSlots = doc.slots.filter((s) => {
        const slot = s as Record<string, unknown>;
        return (
          String(slot.id || '') !== String(itemId) &&
          String(slot._id || '') !== String(itemId)
        );
      });
      if (nextSlots.length !== doc.slots.length) {
        doc.slots = nextSlots;
        doc.markModified('slots' as any);
        changed = true;
      }
    }

    for (const day of doc.days || []) {
      const before = (day.items || []).length;
      day.items = (day.items || []).filter((it) => {
        const rec = it as unknown as Record<string, unknown>;
        return (rec._id || rec.id)?.toString() !== String(itemId);
      });
      if (day.items.length !== before) {
        doc.markModified('days' as any);
        changed = true;
      }
    }

    if (!changed) return null;
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialCalendar;
  }

  async addReviewSuggestions(
    calendarId: string,
    suggestions: IReviewSuggestion[],
  ): Promise<IEditorialCalendar | null> {
    if (!(Types.ObjectId as any).isValid(calendarId)) return null;
    const mapped = suggestions.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      description: s.description,
      impact: s.impact,
      reason: s.reason,
      actionLabel: s.actionLabel,
      applied: Boolean(s.applied),
    }));

    const updated = await this.calendarModel
      .findOneAndUpdate(
        { _id: toObjectId(calendarId) },
        { $set: { reviewSuggestions: mapped } },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialCalendar | null;
  }

  async assignItemTheme(
    calendarId: string,
    itemId: string,
    themeId: string | null,
    theme: string,
  ): Promise<IEditorialCalendar | null> {
    if (!(Types.ObjectId as any).isValid(calendarId)) return null;
    const doc = await this.calendarModel
      .findOne({ _id: toObjectId(calendarId), isActive: { $ne: false } })
      .exec();
    if (!doc) return null;

    let updatedAny = false;

    if (Array.isArray(doc.slots)) {
      for (let i = 0; i < doc.slots.length; i++) {
        const slot = doc.slots[i] as Record<string, unknown>;
        if (
          String(slot.id || '') === String(itemId) ||
          String(slot._id || '') === String(itemId)
        ) {
          doc.slots[i] = {
            ...slot,
            themeId: themeId ?? undefined,
            mainTheme: theme,
            theme,
          };
          doc.markModified('slots' as any);
          updatedAny = true;
        }
      }
    }

    for (const day of doc.days || []) {
      for (const it of day.items || []) {
        const item = it as unknown as Record<string, unknown>;
        if ((item._id || item.id)?.toString() === String(itemId)) {
          item.theme = theme;
          if (themeId && (Types.ObjectId as any).isValid(themeId)) {
            item.themeId = toObjectId(themeId);
          } else {
            item.themeId = undefined;
          }
          doc.markModified('days' as any);
          updatedAny = true;
        }
      }
    }

    if (!updatedAny) return null;
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialCalendar;
  }

  async countItemsByThemeId(themeId: string): Promise<number> {
    const orFilters: Record<string, unknown>[] = [{ 'slots.themeId': themeId }];
    if ((Types.ObjectId as any).isValid(themeId)) {
      orFilters.push({ 'days.items.themeId': toObjectId(themeId) });
      orFilters.push({ 'slots.themeId': toObjectId(themeId) });
    }
    return this.calendarModel
      .countDocuments({
        isActive: { $ne: false },
        $or: orFilters,
      })
      .exec();
  }
}
