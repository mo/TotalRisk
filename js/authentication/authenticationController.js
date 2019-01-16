const firebase = require('firebase/app');
require('firebase/auth');

class AuthenticationController {
    constructor($scope, toastService, soundService) {
        this.vm = this;
        this.$scope = $scope;
        this.toastService = toastService;
        this.soundService = soundService;

        this.vm.states = {
            LOGGED_IN: 0,
            NOT_LOGGED_IN: 1,
            LOGIN: 2,
            SIGNUP: 3,
            EDIT_PROFILE: 4,
            RESET_PASSWORD: 5,
            LOADING: 6
        }

        this.vm.currentState = this.vm.states.LOADING;

        this.vm.loginData = {
            email: '',
            password: ''
        };
        this.vm.signupData = {
            email: '',
            password: '',
            username: ''
        };
        this.vm.newDisplayNameData = '';
        this.vm.resetPasswordMail = '';

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.vm.currentState = this.vm.states.LOGGED_IN;
                this.setUser(user);
                this.toastService.successToast('', 'You have been successfully logged in!');

                firebase.database().ref('/users/' + user.uid).once('value').then(snapshot => {
                    const user = snapshot.val();
                    const chosenDefaultAvatar = user.characters[0];
                    chosenDefaultAvatar.customCharacter = true;
                    this.vm.chosenDefaultAvatar = chosenDefaultAvatar;
                });
            } else {
                this.vm.currentState = this.vm.states.NOT_LOGGED_IN;
            }
        });

        this.vm.login = this.login;
        this.vm.signup = this.signup;
        this.vm.logout = this.logout;
        this.vm.goToState = this.goToState;
        this.vm.updateProfile = this.updateProfile;
        this.vm.cancelUpdate = this.cancelUpdate;
        this.vm.resetPassword = this.resetPassword;
    }

    setUser (user) {
        this.vm.user = {
            displayName: user.displayName,
            email: user.email
        };
        this.vm.newDisplayNameData = this.vm.user.displayName;
    }

    goToState(state) {
        this.soundService.tick.play();
        this.vm.currentState = state;
    }

    resetPassword() {
        this.soundService.tick.play();
        firebase.auth().sendPasswordResetEmail(this.vm.resetPasswordMail).then(() => {
            this.toastService.successToast('', 'Reset password email sent');
            this.vm.resetPasswordMail = '';
            this.vm.currentState = this.vm.states.NOT_LOGGED_IN;
        }).catch(error => {
            if (error.code === 'auth/invalid-email') {
                this.toastService.errorToast(
                    'Reset password error!',
                    'The email entered is not valid'
                );
            } else if (error.code === 'auth/user-not-found') {
                this.toastService.errorToast(
                    'Reset password error!',
                    'No user found'
                );
            }
        });
    }

    login() {
        this.soundService.tick.play();
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            firebase.auth().signInWithEmailAndPassword(this.vm.loginData.email, this.vm.loginData.password)
            .then(result => {
                console.log(result);
                this.vm.currentState = this.vm.states.LOGGED_IN;
                this.setUser(result.user);
                this.vm.loginData = {
                    email: '',
                    password: ''
                };
                this.$scope.$apply();
            })
            .catch(err => {
                console.log('Login error', err);
                if (err.code === 'auth/invalid-email') {
                    this.toastService.errorToast(
                        'Login error!',
                        'The email entered is not valid'
                    );
                } else if (err.code === 'auth/user-disabled') {
                    this.toastService.errorToast(
                        'Login error!',
                        'The user has been disabled'
                    );
                } else if (err.code === 'auth/user-not-found') {
                    this.toastService.errorToast(
                        'Login error!',
                        'No user with this email found'
                    );
                } else if (err.code === 'auth/wrong-password') {
                    this.toastService.errorToast(
                        'Login error!',
                        'Incorrect password'
                    );
                }
            });
        })
        .catch(error => {
            console.log('setPersistence error', error)
        });
    }

    signup() {
        this.soundService.tick.play();
        firebase.database().ref('/users/').once('value').then(snapshot => {
            let users = snapshot.val();
            users = users ? users : [];
            const existingUser = Object.values(users).find(user => user.userName === this.vm.signupData.userName);
            if (existingUser) {
                // username already exists
                throw 'username-taken';
            } else {
                return firebase.auth().createUserWithEmailAndPassword(this.vm.signupData.email, this.vm.signupData.password);
            }
        })
        .then(result => {
            this.vm.user = {
                displayName: this.vm.signupData.userName,
                email: result.user.email
            };
            return firebase.database().ref('users/' + result.user.uid).set({
                userName: this.vm.signupData.userName
            });
        })
        .then(() => {
            const user = firebase.auth().currentUser;
            user.updateProfile({
                displayName: this.vm.signupData.userName
            });
            this.toastService.successToast('', 'You have been registered successfully!');
            this.vm.signupData = {
                email: '',
                password: '',
                userName: ''
            };
        })
        .catch(err => {
            console.log('Sign up error', err);
            if (err.code === 'auth/email-already-in-use') {
                this.toastService.errorToast(
                    'Signup error!',
                    'That email is already registered'
                );
            } else if (err.code === 'auth/invalid-email') {
                this.toastService.errorToast(
                    'Signup error!',
                    'Invalid email'
                );
            } else if (err.code === 'auth/weak-password') {
                this.toastService.errorToast(
                    'Signup error!',
                    'That password is too weak'
                );
            } else if (err === 'username-taken') {
                this.toastService.errorToast(
                    'Signup error!',
                    'That username is already taken'
                );
            }
        });
    }

    logout() {
        this.soundService.tick.play();
        firebase.auth().signOut()
        .then(() => {
            this.vm.currentState = this.vm.states.NOT_LOGGED_IN;
            this.vm.user = {
                displayName: null,
                email: null
            };
            this.vm.loginData = {
                email: '',
                password: ''
            };
            this.vm.signupData = {
                email: '',
                password: '',
                userName: ''
            };
            this.$scope.$apply();
        }).catch(err => {
            console.log('Logout error', err),
            this.toastService.errorToast(
                'Logout error',
                ' '
            );
        });
    }

    updateProfile() {
        this.soundService.tick.play();
        const user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: this.vm.newDisplayNameData
        })
        .then(() => {
            this.vm.currentState = this.vm.states.LOGGED_IN;
            this.vm.user.displayName = this.vm.newDisplayNameData;
            this.$scope.$apply();
        })
        .catch(err => {
            this.toastService.errorToast(
                'Update failed',
                ' '
            );
        });
    }

    cancelUpdate() {
        this.soundService.tick.play();
        this.vm.currentState = this.vm.states.LOGGED_IN;
        this.vm.newDisplayNameData = firebase.auth().currentUser.displayName;
    }
}

module.exports = AuthenticationController;