-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "secret" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New User',
    "image" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT ARRAY['member']::TEXT[],
    "permissions" TEXT[] DEFAULT ARRAY['default']::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "responses" TEXT[]
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Event',
    "description" TEXT NOT NULL DEFAULT 'New Event Description',
    "image" TEXT NOT NULL,
    "date" TEXT NOT NULL DEFAULT 'No date provided',
    "location" TEXT NOT NULL DEFAULT 'No location provided',
    "perks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rsvps" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSuggestion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Event Suggestion',
    "description" TEXT NOT NULL DEFAULT 'Event Suggestion Description',

    CONSTRAINT "EventSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_id_key" ON "Settings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_secret_key" ON "User"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_id_key" ON "Applicant"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_secret_key" ON "Applicant"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "Event_id_key" ON "Event"("id");

-- CreateIndex
CREATE UNIQUE INDEX "EventSuggestion_id_key" ON "EventSuggestion"("id");
