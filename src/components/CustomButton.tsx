import { MergeClasses } from "@/functions";

const buttonStyles = {
  default:
    "bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600",
  gray: "bg-gray-500 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-600",
  green:
    "bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600",
  teal: "bg-teal-500 hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-600",
  purple:
    "bg-purple-500 hover:bg-purple-600 dark:bg-purple-500 dark:hover:bg-purple-600",
  alert: "bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600",
  warning:
    "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600",
  info: "bg-blue-300 hover:bg-blue-400 dark:bg-blue-300 dark:hover:bg-blue-400",
};

type CustomButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: keyof typeof buttonStyles;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function CustomButton({
  children,
  onClick,
  variant,
  className = "",
}: Readonly<CustomButtonProps>) {
  const baseStyles =
    "cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-gray-500 text-white font-bold py-2 px-4 rounded";

  return (
    <button
      className={MergeClasses(
        baseStyles,
        buttonStyles[variant ?? "default"],
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
