export interface Exercise {
  id: number;
  name: string;
  description: string;
  image?: string;
  sets?: number;
  reps?: string;
}

export interface Program {
  id: number;
  title: string;
  difficulty: string;
  duration: string;
  calories: number;
  focus: string;
  exercises: Exercise[];
}