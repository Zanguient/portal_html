/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

var app = angular.module("Login", ['servicos']);

app.controller("loginCtrl", ['$scope',
                              '$http',
                              '$timeout',
                              '$webapi',
                              '$apis',
                              '$autenticacao',
                              '$empresa',
                              function($scope,$http,$timeout,$webapi,$apis,$autenticacao,$empresa){ 

    // Dados da empresa
    $scope.empresa = $empresa;
    // Usuário
    $scope.usuario = { 'nome':'', 'senha':'' };
    $scope.lembrar = false;
    // Mensagem de erro
    $scope.mensagemErro = 'Entre com o usuário e a senha.';                         
    // URL das páginas
    var paginaRedirecionamento = 'app/'; // página de redirecionamento                        
    // flags
    $scope.exibeLayout = false; // flag para indicar se o layout pode ser exibido completamente
    $scope.efetuandoLogin = false;
                                 
    // Acessa a página principal
    var redirecionaPagina = function(){
        // Redireciona
        $scope.exibeLayout = false; 
        window.location.replace(paginaRedirecionamento);
    }; 
    // Exibição do Layout
    var exibeLayout = function(){
      jQuery(document).ready(function() { 
        //$scope.$on('$viewContentLoaded', function(){
            // Carrega layout
            Metronic.init(); // init metronic core components
            Layout.init(); // init current layout
            Login.init();
        });
        $timeout(function(){$scope.exibeLayout  = true}, 500); // espera meio segundo  
    };
    // Inicialização do controller
    $scope.init = function(){
        if($autenticacao.usuarioEstaAutenticado()){
            // Avalia Token
            // Solução jQuery (devido ao domínio diferente, a solução com angular não funciona)
            var jqxhr = $.get($apis.autenticacao.login + '/' + $scope.json.token) 
                           .done(function(data){
                                redirecionaPagina();
                            })
                          .fail(function(failData){
                              // Avaliar código de erro
                              if(failData.status == 500){
                                  // Código 500 => Token já não é mais válido
                                  $autenticacao.removeDadosDeAutenticacao();
                                  exibeLayout();
                              }else{ 
                                  console.log("FALHA AO VALIDAR TOKEN: " + failData.status);
                                  // o que fazer? exibir uma tela indicando falha de comunicação?
                              }
                            });
        }else exibeLayout();
    };
    // Reporta se está em progresso de autenticação
    var progressoLogin = function(emProgresso){
        $scope.efetuandoLogin = emProgresso;
        if(!$scope.$$phase) $scope.$apply();
    };
    // Efetua Login
    $scope.efetuaLogin = function() {
        if ($('.login-form').validate().form()) {
            progressoLogin(true);
            // VALIDA LOGIN
            var jsonAutenticacao = { 'usuario': $scope.usuario.nome, 'senha': $scope.usuario.senha };
            // Envia os dados para autenticação
            /*var novaEmpresaEnviar = $webapi.post($apis.autenticacao.login, '', jsonAutenticacao);
            novaEmpresaEnviar.then(function(dados){
              progressoLogin(false);
              if(dados != null){
                // LOGADO! => Vai para a página principal
                // Armazena se é para lembrar a autenticação
                var checked = !($('input[name="remember"]').attr('checked') === undefined); 
                //$localStorage[$apis.autenticacao.keyLembrar] = JSON.stringify(checked);
                // Armazena o JSON
                //$localStorage[$apis.autenticacao.keyData] = JSON.stringify(data);
                // Esconde Progress
                progressoLogin(false);
                // Redireciona
                redirecionaPagina();
              }else{
                alert("Falha ao receber informações do servidor");
              }
            }, function(reject){
              progressoLogin(false);
              // Exibe mensagem reportando a falha deautenticação
              $scope.mensagemErro = 'Usuário e/ou senha inválido(s).';
              $('div[class="alert alert-danger display-hide"]').show();
            });*/
            // Solução jQuery para POST (devido ao domínio diferente, a solução com angular não funciona)
            var jqxhr = $.post($apis.autenticacao.login, jsonAutenticacao)
                          .done(function(data){
                            // LOGADO! => Vai para a página principal
                            // Atualiza dados de autenticação
                            $autenticacao.atualizaDadosDeAutenticacao(data.token,$scope.lembrar,new Date());
                            // Redireciona e atualiza último horário de autenticação
                            redirecionaPagina(); 
                          })
                          .fail(function(failData){
                              //console.log("LOGIN FAILS: " + failData.status);
                              // Exibe mensagem reportando a falha deautenticação
                              $scope.mensagemErro = 'Usuário e/ou senha inválido(s).';
                              $('div[class="alert alert-danger display-hide"]').show(); // temp...
                          })
                          .always(function(){
                               // Esconde Progress
                              progressoLogin(false);
                          });
            
            return true;
        }
        $scope.mensagemErro = 'Entre com o usuário e a senha.';
        return false;        
    };
}]);

// TEMPLATE
var Login = function() {

    var handleLogin = function() {
        
        $('.login-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            rules: {
                username: {
                    required: true
                },
                password: {
                    required: true
                },
                remember: {
                    required: false
                }
            },

            messages: {
                username: {
                    required: "Usuário deve ser preenchido."
                },
                password: {
                    required: "Senha deve ser preenchida."
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit   
                $('.alert-danger', $('.login-form')).show();
            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                error.insertAfter(element.closest('.input-icon'));
            },

            submitHandler: function(form) {
                form.submit(); // form validation success, call ajax form submit
            }
        });
    }

    var handleForgetPassword = function() {
        $('.forget-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                email: {
                    required: true,
                    email: true
                }
            },

            messages: {
                email: {
                    required: "Email deve ser preenchido."
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit   

            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                error.insertAfter(element.closest('.input-icon'));
            },

            submitHandler: function(form) {
                form.submit();
            }
        });

        $('.forget-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('.forget-form').validate().form()) {
                    $('.forget-form').submit();
                }
                return false;
            }
        });

        jQuery('#forget-password').click(function() {
            jQuery('.login-form').hide();
            jQuery('.forget-form').show();
        });

        jQuery('#back-btn').click(function() {
            jQuery('.login-form').show();
            jQuery('.forget-form').hide();
        });

    }

    var handleRegister = function() {

        function format(state) {
            if (!state.id) return state.text; // optgroup
            return "<img class='flag' src='img/flags/" + state.id.toLowerCase() + ".png'/>&nbsp;&nbsp;" + state.text;
        }

        if (jQuery().select2) {
	        $("#select2_sample4").select2({
	            placeholder: '<i class="fa fa-map-marker"></i>&nbsp;Selecione o Estado',
	            allowClear: true,
	            formatResult: format,
	            formatSelection: format,
	            escapeMarkup: function(m) {
	                return m;
	            }
	        });


	        $('#select2_sample4').change(function() {
	            $('.register-form').validate().element($(this)); //revalidate the chosen dropdown value and show error or success message for the input
	        });
    	}

        $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {

                fullname: {
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
                address: {
                    required: true
                },
                city: {
                    required: true
                },
                country: {
                    required: true
                },

                username: {
                    required: true
                },
                password: {
                    required: true
                },
                rpassword: {
                    equalTo: "#register_password"
                },

                tnc: {
                    required: true
                }
            },

            messages: { // custom messages for radio buttons and checkboxes
                tnc: {
                    required: "Por favor aceite os termos primeiro."
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit   

            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                if (element.attr("name") == "tnc") { // insert checkbox errors after the container                  
                    error.insertAfter($('#register_tnc_error'));
                } else if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function(form) {
                form.submit();
            }
        });

        $('.register-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('.register-form').validate().form()) {
                    $('.register-form').submit();
                }
                return false;
            }
        });

        jQuery('#register-btn').click(function() {
            jQuery('.login-form').hide();
            jQuery('.register-form').show();
        });

        jQuery('#register-back-btn').click(function() {
            jQuery('.login-form').show();
            jQuery('.register-form').hide();
        });
    }

    return {
        //main function to initiate the module
        init: function() {
            handleLogin();
            handleForgetPassword();
            handleRegister();
        }
    };

}();