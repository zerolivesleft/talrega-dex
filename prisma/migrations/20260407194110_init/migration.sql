-- CreateTable
CREATE TABLE "Pokemon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dexNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseHp" INTEGER NOT NULL,
    "baseAtk" INTEGER NOT NULL,
    "baseDef" INTEGER NOT NULL,
    "baseSpAtk" INTEGER NOT NULL,
    "baseSpDef" INTEGER NOT NULL,
    "baseSpeed" INTEGER NOT NULL,
    "baseTotal" INTEGER NOT NULL,
    "height" REAL NOT NULL,
    "weight" REAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "shinyImageUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Pokémon'
);

-- CreateTable
CREATE TABLE "Type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "textColor" TEXT NOT NULL DEFAULT '#FFFFFF'
);

-- CreateTable
CREATE TABLE "TypeMatchup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attackingTypeId" INTEGER NOT NULL,
    "defendingTypeId" INTEGER NOT NULL,
    "multiplier" REAL NOT NULL,
    CONSTRAINT "TypeMatchup_attackingTypeId_fkey" FOREIGN KEY ("attackingTypeId") REFERENCES "Type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TypeMatchup_defendingTypeId_fkey" FOREIGN KEY ("defendingTypeId") REFERENCES "Type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PokemonType" (
    "pokemonId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,

    PRIMARY KEY ("pokemonId", "typeId"),
    CONSTRAINT "PokemonType_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PokemonType_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ability" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PokemonAbility" (
    "pokemonId" INTEGER NOT NULL,
    "abilityId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("pokemonId", "abilityId"),
    CONSTRAINT "PokemonAbility_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PokemonAbility_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "areaType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PokemonLocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pokemonId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "encounterType" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "minLevel" INTEGER NOT NULL,
    "maxLevel" INTEGER NOT NULL,
    "conditions" TEXT,
    CONSTRAINT "PokemonLocation_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PokemonLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evolution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromPokemonId" INTEGER NOT NULL,
    "toPokemonId" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "trigger" TEXT,
    "requiredLevel" INTEGER,
    "requiredItem" TEXT,
    "timeOfDay" TEXT,
    "locationName" TEXT,
    "notes" TEXT,
    CONSTRAINT "Evolution_fromPokemonId_fkey" FOREIGN KEY ("fromPokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evolution_toPokemonId_fkey" FOREIGN KEY ("toPokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Move" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "power" INTEGER,
    "accuracy" INTEGER,
    "pp" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Move_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PokemonMove" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pokemonId" INTEGER NOT NULL,
    "moveId" INTEGER NOT NULL,
    "learnMethod" TEXT NOT NULL,
    "learnLevel" INTEGER,
    "tmNumber" INTEGER,
    CONSTRAINT "PokemonMove_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PokemonMove_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EggGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PokemonEggGroup" (
    "pokemonId" INTEGER NOT NULL,
    "eggGroupId" INTEGER NOT NULL,

    PRIMARY KEY ("pokemonId", "eggGroupId"),
    CONSTRAINT "PokemonEggGroup_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PokemonEggGroup_eggGroupId_fkey" FOREIGN KEY ("eggGroupId") REFERENCES "EggGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_dexNumber_key" ON "Pokemon"("dexNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_name_key" ON "Pokemon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_slug_key" ON "Pokemon"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Type_name_key" ON "Type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TypeMatchup_attackingTypeId_defendingTypeId_key" ON "TypeMatchup"("attackingTypeId", "defendingTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Ability_name_key" ON "Ability"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Move_name_key" ON "Move"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PokemonMove_pokemonId_moveId_learnMethod_learnLevel_key" ON "PokemonMove"("pokemonId", "moveId", "learnMethod", "learnLevel");

-- CreateIndex
CREATE UNIQUE INDEX "EggGroup_name_key" ON "EggGroup"("name");
