import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialMapaDocument = EditorialMapa & Document;

class TomDeVozSubDoc {
  @Prop({ type: [String], default: [] })
  traits: string[];

  @Prop({ type: [String], default: [] })
  rules: string[];
}

class PilarSubDoc {
  @Prop()
  title: string;

  @Prop()
  description: string;
}

class RetinaSubDoc {
  @Prop()
  label: string;

  @Prop()
  weight: number;
}

@Schema({ timestamps: true })
export class EditorialMapa {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'EditorialVersion',
  })
  versionId: Types.ObjectId;

  @Prop({ required: true })
  versionNumber: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  positioningPhrase?: string;

  @Prop({ required: true })
  mensagemCentral: string;

  @Prop({ type: [PilarSubDoc], default: [] })
  pilares: Types.Array<PilarSubDoc>;

  @Prop({
    type: TomDeVozSubDoc,
    default: { traits: [], rules: [] },
  })
  tomDeVoz: TomDeVozSubDoc;

  @Prop({ type: [RetinaSubDoc], default: [] })
  retina: Types.Array<RetinaSubDoc>;
}

export const EditorialMapaSchema = SchemaFactory.createForClass(EditorialMapa);

EditorialMapaSchema.index({ versionId: 1 });
