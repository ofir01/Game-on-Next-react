import GoogleLoginWrapper from '../../Component/GoogleLoginWrapper/GoogleLoginWrapper'
import GoogleLogin from './GoogleLogin/GoogleLogin';

export default function page() {
    return (
        <GoogleLoginWrapper >
            <GoogleLogin />
        </GoogleLoginWrapper>
    )
}
