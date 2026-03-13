/**
 * Поле ввода с опциональной иконкой и отображением ошибки (react-hook-form).
 * @param {Object} props
 * @param {string} [props.type="text"] - type атрибут input
 * @param {string} [props.placeholder] - Плейсхолдер
 * @param {string} [props.autoComplete] - Значение autocomplete
 * @param {Object} [props.register] - Результат register() из react-hook-form
 * @param {{ message?: string }} [props.error] - Объект ошибки (выводится message)
 * @param {string} [props.width="100%"] - Ширина обёртки
 * @param {React.ReactNode} [props.icon] - Иконка слева или справа
 * @param {"left"|"right"} [props.iconPosition="right"] - Позиция иконки
 * @param {string} [props.className] - Доп. CSS-классы
 * @returns {JSX.Element}
 */
export const Input = ({
  type = "text",
  placeholder,
  autoComplete,
  register,
  error,
  width = "100%",
  icon,
  iconPosition = "right",
  className = "",
  ...props
}) => {
  const inputClasses = `
    w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm
    ${error ? "border-red-300" : "border-gray-300"}
    ${icon && iconPosition === "left" ? "pl-10" : ""}
    ${icon && iconPosition === "right" ? "pr-10" : ""}
    ${className}
  `.trim();

  return (
    <div className="relative" style={{ width }}>
      {icon && iconPosition === "left" && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClasses}
        {...register}
        {...props}
      />
      {icon && iconPosition === "right" && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {icon}
        </div>
      )}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message}</p>
      )}
    </div>
  );
};
