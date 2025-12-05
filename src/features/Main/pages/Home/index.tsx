import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
const getTagList = async () => {
  return await invoke<any>('tag_list');
};
const Home = () => {
  console.log('进入Home');
  const { data = [], isError, isPending, error } = useQuery({ queryKey: ['Scenes'], queryFn: getTagList });
  console.log(data);
  console.log(isError);
  console.log(error);
  console.log(isPending);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center"></h2>
    </div>
  );
};

export default Home;
