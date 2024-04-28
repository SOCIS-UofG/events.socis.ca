"use client";

import { type User } from "next-auth";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Role } from "@/types/global/role";
import { trpc } from "@/lib/trpc/client";
import config from "@/lib/config/event.config";
import Navbar from "@/components/ui/global/Navbar";
import CustomCursor from "@/components/ui/global/CustomCursor";
import MainWrapper from "@/components/ui/global/MainWrapper";
import { type Status } from "@/types";
import { Button, Spinner } from "@nextui-org/react";
import Link from "next/link";

/**
 * Next steps page.
 *
 * @returns JSX.Element
 */
export default function NextStepsPage(): JSX.Element {
  return (
    <>
      <Navbar />
      <CustomCursor />
      <Components />
    </>
  );
}

/**
 * The main components for the next steps page.
 *
 * @returns JSX.Element
 */
function Components(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  const { mutateAsync: getAllUsersSecure } =
    trpc.getAllUsersSecure.useMutation();

  /**
   * We need to access the team members from the database.
   */
  useEffect(() => {
    if (status !== "idle") {
      return;
    }

    /**
     * Set the status to loading.
     */
    setStatus("loading");

    /**
     * Fetch the users from the database.
     */
    getAllUsersSecure()
      .then((res) => {
        setUsers(res.users);
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  /**
   * If the fetch is still in progress, display a loading spinner.
   */
  if (status === "loading") {
    return (
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-24">
        <Spinner size="lg" color="primary" />
      </MainWrapper>
    );
  }

  /**
   * Return the main components.
   */
  return (
    <MainWrapper className="z-40 flex min-h-screen w-screen flex-col items-center justify-center gap-7 p-24">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
          SE&RM Approved Members
        </h1>
        <p className="mx-auto  max-w-2xl text-center text-white">
          The following members have been approved to submit SE&RM events. You
          can also download the event planning questionnaire and the event
          planning steps.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          as={Link}
          color="primary"
          href={config.event.planningQuestionaireUrl}
          className="text-white"
        >
          Download the Event Planning Questionnaire
        </Button>
        <Button as={Link} color="default" href={config.event.eventPlanningUrl}>
          Event Planning Steps
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-10">
        {users.map((user) => {
          if (!user.roles.includes(Role.SERM_APPROVED)) {
            return null;
          }

          return (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Image
                className="h-28 w-28 rounded-full"
                src={user.image}
                alt={user.name}
                width={128}
                height={128}
              />
              <p className="text-white">{user.name}</p>
            </div>
          );
        })}
      </div>
    </MainWrapper>
  );
}
