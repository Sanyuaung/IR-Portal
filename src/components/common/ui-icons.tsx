import React from 'react';
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowDownLeftIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsTriangleIcon,
  Bell01Icon,
  Building05Icon,
  CalculatorIcon,
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  Copy01Icon,
  Database01Icon,
  Download01Icon,
  EyeIcon,
  File01Icon,
  File06Icon,
  FilterLinesIcon,
  Globe01Icon,
  HomeLineIcon,
  Key01Icon,
  LayersThree01Icon,
  LinkExternal01Icon,
  Lock01Icon,
  LogIn01Icon,
  LogOut01Icon,
  Mail01Icon,
  Menu01Icon,
  Phone01Icon,
  PlusCircleIcon,
  PrinterIcon,
  QrCode01Icon,
  RefreshCw01Icon,
  SearchLgIcon,
  Send01Icon,
  Server01Icon,
  Settings01Icon,
  ShieldOffIcon,
  ShieldTickIcon,
  Shield02Icon,
  Stars01Icon,
  TrendDown01Icon,
  TrendUp01Icon,
  User01Icon,
  UserPlus01Icon,
  Users01Icon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronSelectorVerticalIcon,
  ChevronUpIcon,
  XIcon,
  Moon01Icon,
  SunIcon,
} from '@untitledui/icons-react/outline';

type UiIconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function asUiIcon(Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>) {
  return ({ size = 16, ...props }: UiIconProps) => <Icon width={size} height={size} {...props} />;
}

export const Shield = asUiIcon(Shield02Icon);
export const ShieldCheck = asUiIcon(ShieldTickIcon);
export const KeyRound = asUiIcon(Key01Icon);
export const Key = asUiIcon(Key01Icon);
export const Smartphone = asUiIcon(Phone01Icon);
export const Mail = asUiIcon(Mail01Icon);
export const QrCode = asUiIcon(QrCode01Icon);
export const Check = asUiIcon(CheckIcon);
export const Copy = asUiIcon(Copy01Icon);
export const AlertCircle = asUiIcon(AlertCircleIcon);
export const Lock = asUiIcon(Lock01Icon);
export const User = asUiIcon(User01Icon);
export const UserPlus = asUiIcon(UserPlus01Icon);
export const Building = asUiIcon(Building05Icon);
export const Building2 = asUiIcon(Building05Icon);
export const Globe2 = asUiIcon(Globe01Icon);
export const RefreshCw = asUiIcon(RefreshCw01Icon);
export const Eye = asUiIcon(EyeIcon);
export const ShieldAlert = asUiIcon(ShieldOffIcon);
export const X = asUiIcon(XIcon);
export const Database = asUiIcon(Database01Icon);
export const Server = asUiIcon(Server01Icon);
export const Layers = asUiIcon(LayersThree01Icon);
export const MenuIcon = asUiIcon(Menu01Icon);
export const Bell = asUiIcon(Bell01Icon);
export const LogOut = asUiIcon(LogOut01Icon);
export const CheckCircle2 = asUiIcon(CheckCircleIcon);
export const Clock = asUiIcon(ClockIcon);
export const Sparkles = asUiIcon(Stars01Icon);
export const Calculator = asUiIcon(CalculatorIcon);
export const Moon = asUiIcon(Moon01Icon);
export const Sun = asUiIcon(SunIcon);
export const ArrowRight = asUiIcon(ArrowRightIcon);
export const ArrowLeft = asUiIcon(ArrowLeftIcon);
export const LogIn = asUiIcon(LogIn01Icon);
export const Send = asUiIcon(Send01Icon);
export const ArrowDown = asUiIcon(ArrowDownIcon);
export const ArrowDownLeft = asUiIcon(ArrowDownLeftIcon);
export const LayoutDashboard = asUiIcon(HomeLineIcon);
export const Settings = asUiIcon(Settings01Icon);
export const DollarSign = asUiIcon(CurrencyDollarIcon);
export const Calendar = asUiIcon(CalendarIcon);
export const Download = asUiIcon(Download01Icon);
export const Users = asUiIcon(Users01Icon);
export const ChevronRight = asUiIcon(ChevronRightIcon);
export const TrendingUp = asUiIcon(TrendUp01Icon);
export const TrendingDown = asUiIcon(TrendDown01Icon);
export const Search = asUiIcon(SearchLgIcon);
export const FileSpreadsheet = asUiIcon(File06Icon);
export const FileText = asUiIcon(File01Icon);
export const ArrowUpDown = asUiIcon(ArrowsTriangleIcon);
export const RotateCcw = asUiIcon(RefreshCw01Icon);
export const Filter = asUiIcon(FilterLinesIcon);
export const Printer = asUiIcon(PrinterIcon);
export const ExternalLink = asUiIcon(LinkExternal01Icon);
export const PlusCircle = asUiIcon(PlusCircleIcon);
export const ChevronDown = asUiIcon(ChevronDownIcon);
export const ChevronUp = asUiIcon(ChevronUpIcon);
export const ChevronSelectorVertical = asUiIcon(ChevronSelectorVerticalIcon);
