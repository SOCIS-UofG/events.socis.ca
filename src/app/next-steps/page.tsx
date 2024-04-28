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
import { Button, NextUIProvider, Spinner } from "@nextui-org/react";
import Link from "next/link";

/**
 * Next steps page.
 *
 * @returns JSX.Element
 */
export default function NextStepsPage(): JSX.Element {
  return (
    <NextUIProvider>
      <Navbar />
      <CustomCursor />
      <Components />
    </NextUIProvider>
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
      <MainWrapper className="relative z-40 flex min-h-screen w-screen flex-col items-center justify-center p-12">
        <Spinner size="lg" color="primary" />
      </MainWrapper>
    );
  }

  /**
   * Return the main components.
   */
  return (
    <MainWrapper className="z-40 flex min-h-screen w-screen flex-col items-center justify-center gap-7 p-12 pt-32 lg:pt-12">
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
          className="btn"
          as={Link}
          color="primary"
          href={config.event.planningQuestionaireUrl}
        >
          Download the Event Planning Questionnaire
        </Button>
        <Button
          className="btn"
          as={Link}
          color="default"
          href={config.event.eventPlanningUrl}
        >
          Event Planning Steps
        </Button>
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-10">
        {users.map((user) => {
          if (!user.roles.includes(Role.SERM_APPROVED)) {
            return <></>;
          }

          return (
            <div className="flex h-72 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-neutral-700/50 bg-secondary p-4 sm:max-w-56">
              <Image
                src={user.image}
                alt={`Image of ${user.name}`}
                className="h-28 w-28 rounded-full"
                width={500}
                height={500}
              />

              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-xl font-semibold text-white">
                  {user.name}
                </h1>
                <p className="text-sm font-thin text-white">{user.email}</p>
                <p className="mt-4 w-fit rounded-md border border-primary bg-emerald-950/50 px-2 py-1 text-xs font-thin text-white">
                  SE&RM Approved
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </MainWrapper>
  );
}
