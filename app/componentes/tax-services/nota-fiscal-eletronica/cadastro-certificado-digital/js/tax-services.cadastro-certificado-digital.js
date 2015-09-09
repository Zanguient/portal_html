/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão: 1.0.1 - 08/09/2015
 *  - Upload do certificado digital junto com a senha
 *
 *  Versão: 1.0 - 03/09/2015
 *
 */

// App
angular.module("tax-services-cadastro-certificado-digital", ['ngFileUpload']) 

.controller("tax-services-cadastro-certificado-digitalCtrl", ['$scope',   
                                            '$state',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout', 
                                            'Upload',
                                            function($scope,$state,/*$campos,*/
                                                     $webapi,$apis,$timeout,Upload){ 
   
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.empresas = [];                                            
    $scope.itens_pagina = [50, 100, 150, 200];                                       
    var divPortletBodyCertificadoDigitalPos = 0; // posição da div que vai receber o loading progress    
    $scope.filtro = { itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0 };  
    // Modal Upload Certificado Digital
    $scope.modalCertificadoDigital = { nrCNPJBase : '',
                                       certificado : '',
                                       senha : ''
                                      }; 
    // Permissões                                           
    var permissaoCadastro = false;
    // flags
    $scope.exibeTela = false;  
    var uploadEmProgresso = false;                                             
                           
                                                
                                                
    // Inicialização do controller
    $scope.taxServices_cadastroCertificadoDigitalInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Nota Fiscal Eletrônica';                          
        $scope.pagina.subtitulo = 'Cadastro de Certificado Digital';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela) buscaCnpjsBase();
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false; 
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega CNPJs base
            buscaCnpjsBase();
        }); 
        // Acessou a tela
        $scope.$emit("acessouTela");
        /*$scope.exibeTela = true;
        buscaCnpjsBase();*/
    }; 
                                                
                                                
                                                
    // PERMISSÕES
    /**
      * Retorna true se o usuário pode cadastrar certificados digitais
      */                                            
    $scope.usuarioPodeCadastrarCertificadosDigitais = function(){
        return permissaoCadastro;    
    }
                                            
    
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaCnpjsBase(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.empresas.length > 0) buscaCnpjsBase();   
    };
                                                
                                                
        
          
                                                
   /* CNPJS BASE */
   var buscaCnpjsBase = function(){
       
       $scope.showProgress(divPortletBodyCertificadoDigitalPos);
        
       // Filtros    
       var filtros = undefined;
       
       if($scope.usuariologado.grupoempresa){
           filtros = [];
           filtros.push({id: /*campos.administracao.tbempresa.cdEmpresaGrupo*/ 103,
                         valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa){
                filtros.push({id: /*campos.administracao.tbempresa.nrCNPJBase*/ 100,
                              valor: $scope.usuariologado.empresa.nu_BaseCnpj});   
           }
       }
       
       $webapi.get($apis.getUrl($apis.administracao.tbempresa, 
                                [$scope.token, 3, 
                                 /* $campos.administracao.tbempresa.tbempresagrupo + $campos.administracao.tbempresagrupo.dsEmpresaGrupo - 100 */201, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){

                // Obtém os dados
                $scope.empresas = dados.Registros;
           
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.empresas.length === 0) $scope.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha o progress
                $scope.hideProgress(divPortletBodyCertificadoDigitalPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao informações referentes ao certificado digital (' + failData.status + ')', true, 'danger', true);
                 
                 $scope.hideProgress(divPortletBodyCertificadoDigitalPos);
              });           
   }
   
   
   
   
   // MODAL CERTIFICADO DIGITAL
   var exibeModalCertificadoDigital = function(){
        $('#modalCertificadoDigital').modal('show');       
   }
   var fechaModalCertificadoDigital = function(){
        $('#modalCertificadoDigital').modal('hide');       
   }
   /** 
     * Armazena o CNPJ base da empresa selecionada e exibe o modal
     */
   $scope.exibeModalCertificadoDigital = function(empresa){
        if(!empresa || empresa === null) return;
        $scope.modalCertificadoDigital.nrCNPJBase = empresa.nrCNPJBase;
        $scope.modalCertificadoDigital.certificado = '';
        $scope.modalCertificadoDigital.senha = '';
        exibeModalCertificadoDigital();
   }
   /**
     * Retorna true se o upload do certificado está em curso
     */
   $scope.uploadEmProgresso = function(){
        return uploadEmProgresso;    
   }
   $scope.mudouCertificado = function(files){
       /*console.log($scope.modalCertificadoDigital.certificado);
       console.log(files);
       console.log(files[0]);*/
   }
   /**
     * Envia para o servidor o arquivo e a senha
     */
   $scope.uploadCertificadoDigital = function(){
       // Valida se o arquivo foi de fato selecionado
       if(!$scope.modalCertificadoDigital.certificado || $scope.modalCertificadoDigital.certificado === null){
           $scope.showModalAlerta('É necessário selecionar o arquivo do certificado!'); 
           return;       
       }
       // Avalia a extensão do arquivo => TEM QUE SER pfx
       var index = $scope.modalCertificadoDigital.certificado.name.lastIndexOf('.');
       if(index === -1 || $scope.modalCertificadoDigital.certificado.name.substr(index + 1) !== 'pfx'){ 
            $scope.showModalAlerta('Arquivo selecionado é inválido! Ele deve ser do tipo .pfx'); 
            return;
       }
       // Valida se a senha foi preenchida
       if(!$scope.modalCertificadoDigital.senha){
           $scope.showModalAlerta('Informe a senha do certificado!'); 
           return;       
       }
           
       uploadEmProgresso = true;
       $scope.showProgress();
       Upload.upload({
                //url: $apis.getUrl($apis.administracao.tbempresa, undefined, { id : 'token', valor : $scope.token }),
                url: $apis.getUrl($apis.administracao.tbempresa, $scope.token, 
                                  [{ id : /*administracao.tbempresa.nrCNPJBase*/ 100, 
                                      valor: $scope.modalCertificadoDigital.nrCNPJBase},
                                   { id: /*administracao.tbempresa.dsCertificadoDigitalSenha*/ 102, 
                                     valor : $scope.modalCertificadoDigital.senha }
                                  ]),
                file: $scope.modalCertificadoDigital.certificado,
                method: 'PATCH',
            }).success(function (data, status, headers, config) {
                $timeout(function() {
                    uploadEmProgresso = false;
                    $scope.hideProgress();
                    // Avalia se o certificado e senha são válidos
                    if(data && data != null){
                        if(data.cdMensagem === 200){
                            // Ambos são válidos
                            fechaModalCertificadoDigital();
                            $scope.showAlert('Upload realizado com sucesso!', true, 'success', true);
                            buscaCnpjsBase(); // relista
                        }else if(data.cdMensagem === 201){
                            $scope.showModalAlerta('Senha informada é inválida!');    
                        }else if(data.cdMensagem === 202){
                            $scope.showModalAlerta('Certificado digital é inválido!'); 
                            //console.log(data.dsMensagem);
                        }else{
                            $scope.showModalAlerta('Certificado e/ou senha não são válidos! (' + data.cdMensagem + ')');    
                        }
                    }else{ 
                        // Não recebeu JSON de resposta...
                        fechaModalCertificadoDigital();
                        buscaCnpjsBase();
                    }
                    
                });
            }).error(function (data, status, headers, config){
                 if(status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(status === 503 || status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else if(status === 500) $scope.showModalAlerta("Só é aceito arquivo PFX!");
                 else $scope.showAlert("Houve uma falha ao fazer upload do do certificado digital (" + status + ")", true, 'danger', true, false);
                uploadEmProgresso = false;
                $scope.hideProgress();
            });
   }
   
   
       
    
}])