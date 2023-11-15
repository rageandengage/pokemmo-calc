import * as I from './data/interface';
import {State} from './state';
import {toID, extend} from './util';

const SPECIAL = ['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Psychic', 'Dark', 'Dragon'];

export class Move implements State.Move {
  gen: I.Generation;
  name: I.MoveName;

  originalName: string;
  ability?: I.AbilityName;
  item?: I.ItemName;
  species?: I.SpeciesName;
  useZ?: boolean;
  useMax?: boolean;
  overrides?: Partial<I.Move>;

  hits: number;
  timesUsed?: number;
  timesUsedWithMetronome?: number;
  bp: number;
  type: I.TypeName;
  category: I.MoveCategory;
  flags: I.MoveFlags;
  secondaries: any;
  target: I.MoveTarget;
  recoil?: [number, number];
  hasCrashDamage: boolean;
  mindBlownRecoil: boolean;
  struggleRecoil: boolean;
  isCrit: boolean;
  drain?: [number, number];
  priority: number;
  dropsStats?: number;
  ignoreDefensive: boolean;
  overrideOffensiveStat?: I.StatIDExceptHP;
  overrideDefensiveStat?: I.StatIDExceptHP;
  overrideOffensivePokemon?: 'target' | 'source';
  overrideDefensivePokemon?: 'target' | 'source';
  breaksProtect: boolean;
  isZ: boolean;
  isMax: boolean;

  constructor(
    gen: I.Generation,
    name: string,
    options: Partial<State.Move> & {
      ability?: I.AbilityName;
      item?: I.ItemName;
      species?: I.SpeciesName;
    } = {}
  ) {
    name = options.name || name;
    this.originalName = name;
    const data: I.Move = extend(true, {name}, gen.moves.get(toID(name)), options.overrides);

    this.hits = 1;
    if (data.multihit) {
      if (typeof data.multihit === 'number') {
        this.hits = data.multihit;
      } else if (options.hits) {
        this.hits = options.hits;
      } else {
        this.hits = (options.ability === 'Skill Link')
          ? data.multihit[1]
          : data.multihit[0] + 1;
      }
    }
    this.timesUsedWithMetronome = options.timesUsedWithMetronome;
    this.gen = gen;
    this.name = data.name;
    this.ability = options.ability;
    this.item = options.item;
    this.useZ = options.useZ;
    this.useMax = options.useMax;
    this.overrides = options.overrides;
    this.species = options.species;

    this.bp = data.basePower;
    // These moves have a type, but the damage they deal is typeless so we override it
    const typelessDamage =
      (gen.num >= 2 && data.id === 'struggle') ||
      (gen.num <= 4 && ['futuresight', 'doomdesire'].includes(data.id));
    this.type = typelessDamage ? '???' : data.type;
    this.category = data.category ||
      (gen.num < 4 ? (SPECIAL.includes(data.type) ? 'Special' : 'Physical') : 'Status');

    const stat = this.category === 'Special' ? 'spa' : 'atk';
    if (data.self?.boosts && data.self.boosts[stat] && data.self.boosts[stat]! < 0) {
      this.dropsStats = Math.abs(data.self.boosts[stat]!);
    }
    this.timesUsed = (this.dropsStats && options.timesUsed) || 1;
    this.secondaries = data.secondaries;
    // For the purposes of the damage formula only 'allAdjacent' and 'allAdjacentFoes' matter, so we
    // simply default to 'any' for the others even though they may not actually be 'any'-target
    this.target = data.target || 'any';
    this.recoil = data.recoil;
    this.hasCrashDamage = !!data.hasCrashDamage;
    this.mindBlownRecoil = !!data.mindBlownRecoil;
    this.struggleRecoil = !!data.struggleRecoil;
    this.isCrit = !!options.isCrit || !!data.willCrit ||
      // These don't *always* crit (255/256 chance), but for the purposes of the calc they do
      gen.num === 1 && ['crabhammer', 'razorleaf', 'slash', 'karate chop'].includes(data.id);
    this.drain = data.drain;
    this.flags = data.flags;
    // The calc doesn't currently care about negative priority moves so we simply default to 0
    this.priority = data.priority || 0;

    this.ignoreDefensive = !!data.ignoreDefensive;
    this.overrideOffensiveStat = data.overrideOffensiveStat;
    this.overrideDefensiveStat = data.overrideDefensiveStat;
    this.overrideOffensivePokemon = data.overrideOffensivePokemon;
    this.overrideDefensivePokemon = data.overrideDefensivePokemon;
    this.breaksProtect = !!data.breaksProtect;
    this.isZ = !!data.isZ;
    this.isMax = !!data.isMax;

    if (!this.bp) {
      // Assume max happiness for these moves because the calc doesn't support happiness
      if (['return', 'frustration', 'pikapapow', 'veeveevolley'].includes(data.id)) {
        this.bp = 102;
      }
    }
  }

  named(...names: string[]) {
    return names.includes(this.name);
  }

  hasType(...types: Array<(I.TypeName | undefined)>) {
    return types.includes(this.type);
  }

  clone() {
    return new Move(this.gen, this.originalName, {
      ability: this.ability,
      item: this.item,
      species: this.species,
      useZ: this.useZ,
      useMax: this.useMax,
      isCrit: this.isCrit,
      hits: this.hits,
      timesUsed: this.timesUsed,
      timesUsedWithMetronome: this.timesUsedWithMetronome,
      overrides: this.overrides,
    });
  }
}
