import mongoose from 'mongoose';

const RENAMES = {
  editorialversions: {
    pid: 'projectId',
    vn: 'versionNumber',
    n: 'name',
    st: 'status',
    cb: 'createdBy',
    ia: 'isActive',
  },
  editorialmapas: {
    vid: 'versionId',
    vn: 'versionNumber',
    n: 'name',
    pp: 'positioningPhrase',
    mc: 'mensagemCentral',
    pl: 'pilares',
    tv: 'tomDeVoz',
    rt: 'retina',
  },
  editorialcalendars: {
    pid: 'projectId',
    evid: 'editorialVersionId',
    n: 'name',
    per: {
      __rename: 'period',
      tp: 'type',
      lb: 'label',
      sd: 'startDate',
      ed: 'endDate',
    },
    plf: 'platforms',
    cap: {
      __rename: 'capacity',
      rw: 'reelsPerWeek',
      lw: 'longVideosPerWeek',
      cw: 'carouselsPerWeek',
      sw: 'staticPostsPerWeek',
      lv: 'livesPerWeek',
      ss: 'storySequencesPerDay',
    },
    obj: 'objective',
    st: 'status',
    dys: {
      __rename: 'days',
      d: 'date',
      it: {
        __rename: 'items',
        d: 'date',
        f: 'format',
        rt: 'retinaType',
        plf: 'platforms',
        o: 'objective',
        stm: 'suggestedTime',
        th: 'theme',
        ru: 'referenceUrl',
        sts: 'status',
        pn: 'provisionalName',
        so: 'strategicObjective',
        pl: 'pillar',
        pdo: 'painDesireObjection',
        ob: 'observations',
        eu: 'exampleUrl',
      },
      sq: {
        __rename: 'storySequences',
        d: 'date',
        si: 'sequenceIndex',
        sc: 'storiesCount',
        fo: 'focus',
        rt: 'retinaType',
        stm: 'suggestedTime',
        sts: 'status',
        th: 'theme',
      },
    },
    rv: {
      __rename: 'reviewSuggestions',
      tp: 'type',
      t: 'title',
      d: 'description',
      im: 'impact',
    },
  },
};

const OLD_INDEXES = {
  editorialversions: ['pid_1_ia_1_vn_-1', 'pid_1_vn_-1'],
  editorialmapas: ['vid_1'],
  editorialcalendars: ['pid_1_ia_1_st_1', 'pid_1_obj_1'],
};

function renameKeys(obj, map) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;

  let changed = false;
  const out = { ...obj };

  for (const [key, value] of Object.entries(out)) {
    const rule = map[key];

    if (rule === undefined) {
      const nested = renameKeys(value, map);
      if (nested !== value) {
        out[key] = nested;
        changed = true;
      }
      continue;
    }

    changed = true;
    const newName = typeof rule === 'string' ? rule : rule.__rename;
    const nestedMap = typeof rule === 'string' ? {} : rule;
    out[newName] = renameKeys(value, nestedMap);
    if (newName !== key) delete out[key];
  }

  return changed ? out : obj;
}

async function migrateCollection(db, name, renameMap) {
  const collections = await db.listCollections({ name }).toArray();
  if (collections.length === 0) {
    console.log(`[skip] ${name}: coleção não existe`);
    return;
  }

  const collection = db.collection(name);
  const cursor = collection.find({});
  let migrated = 0;
  let untouched = 0;

  for await (const doc of cursor) {
    const renamed = renameKeys(doc, renameMap);
    if (renamed === doc) {
      untouched++;
      continue;
    }
    await collection.replaceOne({ _id: doc._id }, renamed);
    migrated++;
  }

  console.log(`[ok] ${name}: ${migrated} migrados, ${untouched} já corretos`);

  for (const indexName of OLD_INDEXES[name] ?? []) {
    const indexInfo = await collection.indexExists(indexName);
    if (indexInfo) {
      await collection.dropIndex(indexName);
      console.log(`[ok] ${name}: índice antigo removido (${indexName})`);
    }
  }
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI não definido');

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error('Falha ao conectar');

  console.log('Revertendo short field names...\n');

  for (const [name, renameMap] of Object.entries(RENAMES)) {
    await migrateCollection(db, name, renameMap);
  }

  await mongoose.disconnect();
  console.log('\nMigração concluída.');
}

main().catch((err) => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
