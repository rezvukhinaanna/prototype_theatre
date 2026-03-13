/**
 * Полноэкранный оверлей с индикатором загрузки (спиннер).
 * @returns {JSX.Element}
 */
export const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
    </div>
  );
};
