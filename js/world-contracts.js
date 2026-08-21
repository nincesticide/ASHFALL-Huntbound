(function installAshfallWorldContracts(root) {
  'use strict';

  const EMBERWATCH_RETURN_SPAWNS = Object.freeze([
    Object.freeze([14, 12]),
    Object.freeze([16, 12]),
    Object.freeze([14, 11]),
    Object.freeze([16, 11]),
  ]);
  const EMBERWOOD_ENTRY_SPAWNS = Object.freeze([
    Object.freeze([5, 9]),
    Object.freeze([6, 9]),
    Object.freeze([5, 10]),
    Object.freeze([6, 10]),
  ]);
  const EMBERWATCH_SURFACE_GATE = Object.freeze({ x: 2, y: 9 });

  function connectedPlayers(players) {
    return Object.values(players || {}).filter((player) => player?.connected !== false);
  }

  function stageAtSpawns(players, spawns, facing, coordinateKeys) {
    connectedPlayers(players).forEach((player, index) => {
      const spawn = spawns[index % spawns.length];
      player[coordinateKeys[0]] = spawn[0];
      player[coordinateKeys[1]] = spawn[1];
      player.facing = facing;
    });
  }

  function stagePartyAtBonfire(players) {
    stageAtSpawns(players, EMBERWATCH_RETURN_SPAWNS, 'north', ['campX', 'campY']);
    connectedPlayers(players).forEach((player) => {
      player.ready = false;
      delete player.worldX;
      delete player.worldY;
    });
    return players;
  }

  function stagePartyInEmberwood(players) {
    stageAtSpawns(players, EMBERWOOD_ENTRY_SPAWNS, 'east', ['worldX', 'worldY']);
    return players;
  }

  function resetRoomToEmberwatch(room) {
    if (!room) return room;
    room.worldV14 = null;
    room.worldSelectionV141 = null;
    room.delveId = null;
    stagePartyAtBonfire(room.players);
    return room;
  }

  function isWithinManhattan(playerX, playerY, target, distance = 1) {
    return Math.abs(playerX - target.x) + Math.abs(playerY - target.y) <= distance;
  }

  function exactObjectAtTile(objects, x, y) {
    return (objects || []).find((object) => object.x === x && object.y === y) || null;
  }

  root.AshfallWorldContracts = Object.freeze({
    EMBERWATCH_RETURN_SPAWNS,
    EMBERWOOD_ENTRY_SPAWNS,
    EMBERWATCH_SURFACE_GATE,
    stagePartyAtBonfire,
    stagePartyInEmberwood,
    resetRoomToEmberwatch,
    isWithinManhattan,
    exactObjectAtTile,
  });
})(globalThis);
