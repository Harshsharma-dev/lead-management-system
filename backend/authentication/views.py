from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            return Response(
                {
                    'success': True,
                    'message': 'User registered successfully',
                    'data': {
                        'user': UserSerializer(user).data,
                        'access_token': access_token,
                        'refresh_token': refresh_token,
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                'success': False,
                'message': 'Registration failed',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login endpoint
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return Response(
            {
                'success': True,
                'message': 'Login successful',
                'data': {
                    'user': UserSerializer(user).data,
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                }
            },
            status=status.HTTP_200_OK
        )
    
    return Response(
        {
            'success': False,
            'message': 'Login failed',
            'errors': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint - blacklist the refresh token
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response(
            {
                'success': True,
                'message': 'Logout successful'
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {
                'success': False,
                'message': 'Logout failed',
                'error': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user profile
    """
    serializer = UserSerializer(request.user)
    return Response(
        {
            'success': True,
            'data': serializer.data
        }
    )


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Get or update user profile
    """
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(
            {
                'success': True,
                'data': serializer.data
            }
        )
    
    # Handle PUT/PATCH for updates
    serializer = UserSerializer(
        request.user, 
        data=request.data, 
        partial=request.method == 'PATCH'
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                'success': True,
                'message': 'Profile updated successfully',
                'data': serializer.data
            }
        )
    
    return Response(
        {
            'success': False,
            'message': 'Profile update failed',
            'errors': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """
    Verify if the current token is valid
    """
    return Response(
        {
            'success': True,
            'message': 'Token is valid',
            'data': {
                'user': UserSerializer(request.user).data
            }
        }
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {
                'success': False,
                'message': 'Both old and new passwords are required',
                'errors': {
                    'old_password': ['This field is required.'] if not old_password else [],
                    'new_password': ['This field is required.'] if not new_password else []
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify old password
    if not authenticate(username=request.user.username, password=old_password):
        return Response(
            {
                'success': False,
                'message': 'Current password is incorrect',
                'errors': {
                    'old_password': ['Current password is incorrect.']
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate new password
    if len(new_password) < 8:
        return Response(
            {
                'success': False,
                'message': 'New password must be at least 8 characters long',
                'errors': {
                    'new_password': ['Password must be at least 8 characters long.']
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Change password
    user = request.user
    user.set_password(new_password)
    user.save()
    
    return Response(
        {
            'success': True,
            'message': 'Password changed successfully'
        }
    )
