import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageMeta
        title="SignIn | Landify"
        description="Sign in to your account"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
