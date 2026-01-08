export const HYPSettings = () => {
  return (
    <div className="p-3 pt-[calc(theme(spacing.10)+theme(spacing.3))] overflow-auto w-full">
      <div className="flex flex-col items-start gap-3">
        <div className="text-large mt-2">Folders to Scan</div>
        <div className="text-small mb-2 text-default-500">Select the folders that have your audio files.</div>
      </div>
    </div>
  );
};
