import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const weightUnitEnum = pgEnum('weight_unit', ['lbs', 'kg']);

// ---------------------------------------------------------------------------
// exercise_definitions
// ---------------------------------------------------------------------------

export const exerciseDefinitions = pgTable(
  'exercise_definitions',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    muscleGroup: text('muscle_group'),
    isCustom: boolean('is_custom').notNull().default(false),
    createdByUserId: text('created_by_user_id'), // null = global; clerk user_id = custom
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    nameIdx: index('exercise_definitions_name_idx').on(t.name),
    userIdx: index('exercise_definitions_user_idx').on(t.createdByUserId),
  })
);

// ---------------------------------------------------------------------------
// workouts
// ---------------------------------------------------------------------------

export const workouts = pgTable(
  'workouts',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    startedAt: timestamp('started_at').notNull(),
    endedAt: timestamp('ended_at'), // nullable — set when session ends
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('workouts_user_id_idx').on(t.userId),
    userDateIdx: index('workouts_user_date_idx').on(t.userId, t.startedAt),
  })
);

// ---------------------------------------------------------------------------
// workout_exercises
// ---------------------------------------------------------------------------

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: serial('id').primaryKey(),
    workoutId: integer('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseDefinitionId: integer('exercise_definition_id')
      .notNull()
      .references(() => exerciseDefinitions.id, { onDelete: 'restrict' }),
    orderIndex: integer('order_index').notNull().default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    workoutIdx: index('workout_exercises_workout_id_idx').on(t.workoutId),
    exerciseDefIdx: index('workout_exercises_exercise_def_idx').on(t.exerciseDefinitionId),
  })
);

// ---------------------------------------------------------------------------
// sets
// ---------------------------------------------------------------------------

export const sets = pgTable(
  'sets',
  {
    id: serial('id').primaryKey(),
    workoutExerciseId: integer('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    reps: integer('reps').notNull(),
    weight: numeric('weight', { precision: 6, scale: 2 }).notNull(),
    weightUnit: weightUnitEnum('weight_unit').notNull().default('lbs'),
    isWarmup: boolean('is_warmup').notNull().default(false),
    rpe: numeric('rpe', { precision: 3, scale: 1 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    workoutExerciseIdx: index('sets_workout_exercise_id_idx').on(t.workoutExerciseId),
  })
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const exerciseDefinitionsRelations = relations(exerciseDefinitions, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exerciseDefinition: one(exerciseDefinitions, {
    fields: [workoutExercises.exerciseDefinitionId],
    references: [exerciseDefinitions.id],
  }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ---------------------------------------------------------------------------
// TypeScript types
// ---------------------------------------------------------------------------

export type ExerciseDefinition = InferSelectModel<typeof exerciseDefinitions>;
export type NewExerciseDefinition = InferInsertModel<typeof exerciseDefinitions>;

export type Workout = InferSelectModel<typeof workouts>;
export type NewWorkout = InferInsertModel<typeof workouts>;

export type WorkoutExercise = InferSelectModel<typeof workoutExercises>;
export type NewWorkoutExercise = InferInsertModel<typeof workoutExercises>;

export type Set = InferSelectModel<typeof sets>;
export type NewSet = InferInsertModel<typeof sets>;
