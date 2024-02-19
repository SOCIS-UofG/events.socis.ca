"use client";

import { type User } from "next-auth";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Role } from "@/types/role";
import {
  LoadingSpinnerCenter,
  MainWrapper,
  Navbar,
  ErrorMessage,
  CustomCursor,
} from "socis-components";
import { trpc } from "@/lib/trpc/client";

/**
 * Status type
 */
enum Status {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

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
  const [status, setStatus] = useState(Status.IDLE);
  const { mutateAsync: getAllUsersSecure } =
    trpc.getAllUsersSecure.useMutation();

  /**
   * We need to access the team members from the database.
   */
  useEffect(() => {
    if (status !== Status.IDLE) {
      return;
    }

    /**
     * Set the status to loading.
     */
    setStatus(Status.LOADING);

    /**
     * Fetch the users from the database.
     */
    getAllUsersSecure()
      .then((res) => {
        setUsers(res.users);
        setStatus(Status.SUCCESS);
      })
      .catch(() => {
        setStatus(Status.ERROR);
      });
  }, []);

  /**
   * If the fetch is still in progress, display a loading spinner.
   */
  if (status === Status.LOADING) {
    return <LoadingSpinnerCenter />;
  }

  /**
   * If the fetch failed, display an error message.
   */
  if (status === Status.ERROR) {
    return (
      <MainWrapper>
        <ErrorMessage>
          Something went wrong while fetching the team from the database.
        </ErrorMessage>
      </MainWrapper>
    );
  }

  /**
   * Return the main components.
   */
  return (
    <MainWrapper className="z-40">
      <a href="#" className="text-white">
        Download the Event Planning Questionnaire
      </a>
      <a href="#" className="text-white">
        Submit a SE&RM Event Proposal
      </a>
      <h1 className="text-center text-3xl font-bold text-white lg:text-5xl">
        SE&RM Approved Members
      </h1>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-10">
        {users.map((user) => {
          if (user.roles.includes(Role.SERM_APPROVED)) {
            return (
              <div className="flex flex-row items-center justify-center gap-2">
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
          }
        })}
      </div>
    </MainWrapper>
  );
}
