-- CreateTable
CREATE TABLE "OutstandingToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "jti" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "OutstandingToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlacklistedToken" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "blacklistedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlacklistedToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutstandingToken" ADD CONSTRAINT "OutstandingToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlacklistedToken" ADD CONSTRAINT "BlacklistedToken_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "OutstandingToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
