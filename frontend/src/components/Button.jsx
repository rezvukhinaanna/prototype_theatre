/**
 * Кнопка с вариантами оформления (primary/secondary) и настраиваемыми размерами.
 * @param {Object} props
 * @param {"button"|"submit"|"reset"} [props.type="button"] - Тип кнопки
 * @param {"primary"|"secondary"} [props.variant="primary"] - Стиль кнопки
 * @param {boolean} [props.disabled=false] - Заблокирована ли кнопка
 * @param {string} [props.width="auto"] - Ширина (CSS)
 * @param {string} [props.height="auto"] - Высота (CSS)
 * @param {string} [props.fontSize="1rem"] - Размер шрифта
 * @param {string} [props.margin="0"] - Внешние отступы
 * @param {React.ReactNode} [props.children] - Содержимое кнопки
 * @param {string} [props.className] - Доп. CSS-классы
 * @returns {JSX.Element}
 */
export const Button = ({
  type = "button",
  variant = "primary",
  disabled = false,
  width = "auto",
  height = "auto",
  fontSize = "1rem",
  margin = "0",
  children,
  className = "",
  ...props
}) => {
  const baseClasses = `
    rounded-xl transition-all duration-300 font-medium cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variant === "primary" 
      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none" 
      : variant === "secondary"
      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
      : ""
    }
    ${className}
  `.trim();

  return (
    <button
      type={type}
      disabled={disabled}
      className={baseClasses}
      style={{
        width,
        height,
        fontSize,
        margin,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
