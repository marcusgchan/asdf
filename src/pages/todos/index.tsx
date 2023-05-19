import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { RouterOutputs } from "~/utils/api";

type DisplayProps = RouterOutputs["asdf"]["hello"];

export default function Todos() {
  const router = useRouter();
  const { data: asdf, isLoading } = api.asdf.hello.useQuery({
    message: "asdfasdf",
  });
  const mutation = api.asdf.createThing.useMutation();

  if (isLoading || !asdf) {
    return <div>loading...</div>;
  }
  return (
    <>
      <button
        className="flex rounded-md border-2 border-blue-500 p-2"
        onClick={() => {
          mutation.mutate({ foo: "asdfasdf" });
        }}
      >
        asdf
      </button>
    </>
  );
}

function Display(props: DisplayProps) {
  return <h1>{props.greetingsssssss}</h1>;
}
