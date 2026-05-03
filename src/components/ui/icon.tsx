import * as React from "react";
import {
  AlertCircle as LucideAlertCircle,
  ArrowLeft as LucideArrowLeft,
  Award as LucideAward,
  Bookmark as LucideBookmark,
  BookmarkCheck as LucideBookmarkCheck,
  BookOpen as LucideBookOpen,
  Calendar as LucideCalendar,
  CheckCircle as LucideCheckCircle,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  Compass as LucideCompass,
  DollarSign as LucideDollarSign,
  EyeOff as LucideEyeOff,
  FileText as LucideFileText,
  Globe as LucideGlobe,
  GraduationCap as LucideGraduationCap,
  Home as LucideHome,
  LogOut as LucideLogOut,
  Mail as LucideMail,
  MessageCircle as LucideMessageCircle,
  Settings as LucideSettings,
  Sparkles as LucideSparkles,
  Star as LucideStar,
  TrendingUp as LucideTrendingUp,
  UploadCloud as LucideUploadCloud,
  User as LucideUser,
  XCircle as LucideXCircle,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

export type IconProps = LucideProps;

const DEFAULT_PROPS: Partial<LucideProps> = {
  strokeWidth: 1.6,
  size: 20,
  "aria-hidden": true,
};

function makeIcon(
  Component: React.ComponentType<LucideProps>,
  displayName: string,
) {
  const Wrapped = React.forwardRef<SVGSVGElement, IconProps>(function Wrapped(
    { className, ...props },
    ref,
  ) {
    return (
      <Component
        ref={ref}
        {...DEFAULT_PROPS}
        {...props}
        className={cn("shrink-0 inline-block align-[-0.125em]", className)}
      />
    );
  });
  Wrapped.displayName = displayName;
  return Wrapped;
}

export const AlertCircle    = makeIcon(LucideAlertCircle,    "Icon.AlertCircle");
export const ArrowLeft      = makeIcon(LucideArrowLeft,      "Icon.ArrowLeft");
export const Award          = makeIcon(LucideAward,          "Icon.Award");
export const Bookmark       = makeIcon(LucideBookmark,       "Icon.Bookmark");
export const BookmarkCheck  = makeIcon(LucideBookmarkCheck,  "Icon.BookmarkCheck");
export const BookOpen       = makeIcon(LucideBookOpen,       "Icon.BookOpen");
export const Calendar       = makeIcon(LucideCalendar,       "Icon.Calendar");
export const CheckCircle    = makeIcon(LucideCheckCircle,    "Icon.CheckCircle");
export const ChevronLeft    = makeIcon(LucideChevronLeft,    "Icon.ChevronLeft");
export const ChevronRight   = makeIcon(LucideChevronRight,   "Icon.ChevronRight");
export const Compass        = makeIcon(LucideCompass,        "Icon.Compass");
export const DollarSign     = makeIcon(LucideDollarSign,     "Icon.DollarSign");
export const EyeOff         = makeIcon(LucideEyeOff,         "Icon.EyeOff");
export const FileText       = makeIcon(LucideFileText,       "Icon.FileText");
export const Globe          = makeIcon(LucideGlobe,          "Icon.Globe");
export const GraduationCap  = makeIcon(LucideGraduationCap,  "Icon.GraduationCap");
export const Home           = makeIcon(LucideHome,           "Icon.Home");
export const LogOut         = makeIcon(LucideLogOut,         "Icon.LogOut");
export const Mail           = makeIcon(LucideMail,           "Icon.Mail");
export const MessageCircle  = makeIcon(LucideMessageCircle,  "Icon.MessageCircle");
export const Settings       = makeIcon(LucideSettings,       "Icon.Settings");
export const Sparkles       = makeIcon(LucideSparkles,       "Icon.Sparkles");
export const Star           = makeIcon(LucideStar,           "Icon.Star");
export const TrendingUp     = makeIcon(LucideTrendingUp,     "Icon.TrendingUp");
export const UploadCloud    = makeIcon(LucideUploadCloud,    "Icon.UploadCloud");
export const User           = makeIcon(LucideUser,           "Icon.User");
export const XCircle        = makeIcon(LucideXCircle,        "Icon.XCircle");

export const Icon = {
  AlertCircle,
  ArrowLeft,
  Award,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Compass,
  DollarSign,
  EyeOff,
  FileText,
  Globe,
  GraduationCap,
  Home,
  LogOut,
  Mail,
  MessageCircle,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  UploadCloud,
  User,
  XCircle,
};
