import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageMeta
        title="SignUp | Landify"
        description="Sign up to create an account"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
