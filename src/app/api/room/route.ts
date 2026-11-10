import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ActionSkillActor, CharacterId, RoomState, SkillStatus } from '@/types/game';
import { CLUE_CARDS } from '@/data/cards';

// Vercel serverless writable path
const STORE_PATH = path.join(os.tmpdir(), 'mumystery-room-store.json');

// Memory fallback cache across invocations in same container
const globalMemoryStore = ((globalThis as unknown as { __roomStore?: Record<string, RoomState> }).__roomStore =
  (globalThis as unknown as { __roomStore?: Record<string, RoomState> }).__roomStore || {});

function createInitialRoom(roomCode: string): RoomState {
  const cardOwners: Record<string, CharacterId | null> = {};
  for (const c of CLUE_CARDS) {
    cardOwners[c.id] = null;
  }
  return {
    roomCode,
    scenarioId: 'new-frontier',
    playerCount: 7,
    gate0Unlocked: false,
    gate1Unlocked: false,
    gate2Unlocked: false,
    gate3Unlocked: false,
    cardOwners,
    bribedResident: null,
    cliveSecretPick: null,
    graceSecretPick: null,
    skillStatus: {},
    jailedCharacter: null,
    cliveEscapeRoll: null,
    chaseDiceRolls: {},
    playerScores: {},
    updatedAt: Date.now()
  };
}

function readStore(): Record<string, RoomState> {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...globalMemoryStore, ...parsed };
    }
  } catch {
    // ignore read error
  }
  return { ...globalMemoryStore };
}

function writeStore(store: Record<string, RoomState>) {
  try {
    Object.assign(globalMemoryStore, store);
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // ignore write error
  }
}

function getOrCreateRoom(roomCode: string): {
  store: Record<string, RoomState>;
  room: RoomState;
} {
  const code = (roomCode || '1889').trim().toUpperCase();
  const store = readStore();
  if (!store[code]) {
    store[code] = createInitialRoom(code);
    writeStore(store);
  }
  return { store, room: store[code] };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') || '1889';
  const { room } = getOrCreateRoom(code);
  return NextResponse.json(room);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = (body.roomCode || '1889').trim().toUpperCase();
    const action = body.action as string;
    const { store, room } = getOrCreateRoom(code);

    switch (action) {
      case 'set_player_count': {
        room.playerCount = body.playerCount === 6 ? 6 : 7;
        break;
      }

      case 'unlock_gate': {
        const gate = Number(body.gate);
        if (gate === 0) {
          room.gate0Unlocked = true;
        } else if (gate === 1) {
          room.gate0Unlocked = true;
          room.gate1Unlocked = true;
        } else if (gate === 2) {
          room.gate2Unlocked = true;
        } else if (gate === 3) {
          room.gate3Unlocked = true;
        }
        break;
      }

      case 'acquire_card': {
        if (!room.gate0Unlocked) {
          return NextResponse.json(
            { error: '아직 1차 조사 단계가 시작되지 않았습니다. 마스터의 원터치 해금을 기다려 주세요.' },
            { status: 400 }
          );
        }
        const cardId = String(body.cardId);
        const characterId = body.characterId as CharacterId;
        if (room.cardOwners[cardId] && room.cardOwners[cardId] !== characterId) {
          return NextResponse.json(
            { error: '이미 다른 플레이어가 획득한 카드입니다.' },
            { status: 400 }
          );
        }
        room.cardOwners[cardId] = characterId;
        break;
      }

      case 'transfer_card': {
        const cardId = String(body.cardId);
        const toCharacterId = body.toCharacterId as CharacterId;
        room.cardOwners[cardId] = toCharacterId;
        break;
      }

      case 'return_card': {
        const cardId = String(body.cardId);
        room.cardOwners[cardId] = null;
        break;
      }

      case 'set_bribe': {
        room.bribedResident = (body.residentId as CharacterId) || null;
        break;
      }

      case 'submit_secret_pick': {
        const actor = body.actor as 'clive' | 'grace';
        const targetId = (body.targetId as CharacterId) || null;
        if (actor === 'clive') {
          room.cliveSecretPick = targetId;
        } else if (actor === 'grace') {
          room.graceSecretPick = targetId;
        }
        break;
      }

      case 'set_jailed': {
        room.jailedCharacter = (body.characterId as CharacterId) || null;
        if (room.jailedCharacter !== 'clive') {
          room.cliveEscapeRoll = null;
        }
        break;
      }

      case 'roll_clive_escape': {
        room.cliveEscapeRoll =
          typeof body.value === 'number' ? body.value : null;
        break;
      }

      case 'set_chase_dice': {
        const characterId = body.characterId as CharacterId;
        const value = body.value;
        if (value === null || value === undefined) {
          delete room.chaseDiceRolls[characterId];
        } else {
          room.chaseDiceRolls[characterId] = Number(value);
        }
        break;
      }

      case 'set_skill_status': {
        const actor = body.actor as ActionSkillActor;
        const status = body.status as SkillStatus;
        if (!room.skillStatus) room.skillStatus = {};
        room.skillStatus[actor] = status;
        break;
      }

      case 'set_player_score': {
        const characterId = body.characterId as CharacterId;
        const score = Number(body.score);
        if (!room.playerScores) room.playerScores = {};
        room.playerScores[characterId] = score;
        break;
      }

      case 'reset_room': {
        store[code] = createInitialRoom(code);
        writeStore(store);
        return NextResponse.json(store[code]);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    room.updatedAt = Date.now();
    store[code] = room;
    writeStore(store);
    return NextResponse.json(room);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
