"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { Button, ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const locale = "en";

interface SmartCTAProps extends ButtonProps {
  fallbackAction?: "login" | "modal"; // "login" redirects, "modal" shows an inline modal
  modalTitle?: string;
  modalDesc?: string;
  onAuthenticatedClick?: () => void;
}

export function SmartCTA({ 
  fallbackAction = "login", 
  modalTitle = "Sign In Required", 
  modalDesc = "Please sign in to save your results and personalize your experience.",
  onAuthenticatedClick,
  children,
  ...props 
}: SmartCTAProps) {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (user) {
      if (onAuthenticatedClick) onAuthenticatedClick();
    } else {
      e.preventDefault();
      if (fallbackAction === "modal") {
        setShowModal(true);
      } else {
        // Build return URL or just redirect to login
        router.push(`/${params.locale}/login`);
      }
    }
  };

  return (
    <>
      <Button onClick={handleClick} {...props}>
        {children}
      </Button>

      {/* Fallback Modal for inclusive visitor experience */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl text-brand-blue">{modalTitle}</DialogTitle>
            <DialogDescription className="text-lg pt-2 text-slate-600">
              {modalDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              className="w-full text-lg py-6 bg-brand-green hover:bg-brand-green/90"
              onClick={() => router.push(`/${params.locale}/login`)}
            >
              Sign In Now
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-lg py-6"
              onClick={() => setShowModal(false)}
            >
              Continue as Guest
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
